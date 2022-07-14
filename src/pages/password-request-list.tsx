import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { PasswordRequest, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

const PasswordRequestList = () => {
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const passwordRequests = useMemo(() => statePasswordRequests.sort((r1, r2) => r1.time > r2.time ? 1 : -1), [statePasswordRequests])

  return(
    <IonPage>
      <Header title={labels.passwordRequests} />
      <IonContent fullscreen className="ion-padding">
          <IonList>
            {passwordRequests.length === 0 ? 
              <IonItem> 
                <IonLabel>{labels.noData}</IonLabel>
              </IonItem>  
            : passwordRequests.map(r => 
                <IonItem key={r.id} routerLink={`/password-retreive/${r.id}`}>
                  <IonLabel>
                    <IonText style={{color: colors[0].name}}>{r.mobile}</IonText>
                    <IonText style={{color: colors[1].name}}>{r.status === 'n' ? labels.new : labels.resolved}</IonText>
                    <IonText style={{color: colors[2].name}}>{moment(r.time).fromNow()}</IonText>
                  </IonLabel>
                </IonItem>    
              )
            }
          </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default PasswordRequestList
