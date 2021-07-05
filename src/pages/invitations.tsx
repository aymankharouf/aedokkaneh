import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { Friend, UserInfo } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'

type ExtendedFriend = Friend & {
  userInfo: UserInfo
}
const Invitations = () => {
  const { state } = useContext(StateContext)
  const [invitations, setInvitations] = useState<ExtendedFriend[]>([])
  useEffect(() => {
    setInvitations(() => {
      const invitations = state.invitations.filter(i => i.status === 'n')
      return invitations.map(i => {
        const userInfo = state.users.find(u => u.id === i.userId)!
        return {
          ...i,
          userInfo
        }
      })
    })
  }, [state.users, state.invitations])
  let j = 0
  return(
    <IonPage>
      <Header title={labels.invitations} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {invitations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : invitations.map(i => 
              <IonItem key={j++} routerLink={`/invitation-details/${i.userInfo.id}/mobile/${i.mobile}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${i.userInfo.name}: ${i.userInfo.mobile}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${i.name}: ${i.mobile}`}</IonText>
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

export default Invitations
