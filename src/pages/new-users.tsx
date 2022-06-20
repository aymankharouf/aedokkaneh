import { useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { CustomerInfo, State, UserInfo } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'


const NewUsers = () => {
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const [newUsers, setNewUsers] = useState<UserInfo[]>([])
  useEffect(() => {
    setNewUsers(() => {
      const newUsers = stateUsers.filter(u => !stateCustomers.find(c => c.id === u.id))
      return newUsers.sort((u1, u2) => u2.time > u1.time ? 1 : -1)
    })
  }, [stateUsers, stateCustomers])
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
