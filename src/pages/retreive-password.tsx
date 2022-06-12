import { useContext, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { resolvePasswordRequest, getMessage } from '../data/actions'
import labels from '../data/labels'
import { randomColors } from '../data/config'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { useHistory, useLocation, useParams } from 'react-router'
import { Err } from '../data/types'

type Params = {
  id: string
}
const RetreivePassword = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [passwordRequest] = useState(() => state.passwordRequests.find(r => r.id === params.id)!)
  const [userInfo] = useState(() => state.users.find(u => u.mobile === passwordRequest.mobile))
  const [password] = useState(() => {
    const password = userInfo?.colors.map(c => randomColors.find(rc => rc.name === c)!.id)
    return password?.join('')
  })
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