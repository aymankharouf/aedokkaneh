import { useMemo } from 'react'
import { resolvePasswordRequest, getMessage } from '../data/actions'
import labels from '../data/labels'
import { randomColors } from '../data/config'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { useHistory, useLocation, useParams } from 'react-router'
import { Customer, Err, PasswordRequest, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const RetreivePassword = () => {
  const params = useParams<Params>()
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const passwordRequest = useMemo(() => statePasswordRequests.find(r => r.id === params.id)!, [statePasswordRequests, params.id])
  const userInfo = useMemo(() => stateCustomers.find(c => c.mobile === passwordRequest.mobile), [stateCustomers, passwordRequest])
  const password = useMemo(() => userInfo?.colors.map(c => randomColors.find(rc => rc.name === c)!.id).join(''), [userInfo])
  const handleResolve = () => {
    try{
      resolvePasswordRequest(params.id)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={labels.retreivePassword} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={userInfo?.name || labels.unknown} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={passwordRequest.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.password}
            </IonLabel>
            <IonInput 
              value={password || ''} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleResolve} color="success">
          <IonIcon ios={checkmarkOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default RetreivePassword