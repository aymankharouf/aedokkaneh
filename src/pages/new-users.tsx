import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { UserInfo } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'


const NewUsers = () => {
  const { state } = useContext(StateContext)
  const [newUsers, setNewUsers] = useState<UserInfo[]>([])
  useEffect(() => {
    setNewUsers(() => {
      const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id))
      return newUsers.sort((u1, u2) => u2.time > u1.time ? 1 : -1)
    })
  }, [state.users, state.customers])
  return(
    <IonPage>
      <Header title={labels.newUsers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {newUsers.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : newUsers.map(u => 
              <IonItem key={u.id} routerLink={`/approve-user/${u.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${labels.user}: ${u.name}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.mobile}: ${u.mobile}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(u.time).fromNow()}</IonText>
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

export default NewUsers
