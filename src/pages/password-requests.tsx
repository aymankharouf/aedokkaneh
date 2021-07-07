import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { PasswordRequest } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'

const PasswordRequests = () => {
  const { state } = useContext(StateContext)
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests.sort((r1, r2) => r1.time > r2.time ? 1 : -1))
  }, [state.passwordRequests])

  return(
    <IonPage>
      <Header title={labels.passwordRequests} />
      <IonContent fullscreen>
          <IonList>
            {passwordRequests.length === 0 ? 
              <IonItem> 
                <IonLabel>{labels.noData}</IonLabel>
              </IonItem>  
            : passwordRequests.map(r => 
                <IonItem key={r.id} routerLink={`/retreive-password/${r.id}`}>
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

export default PasswordRequests
