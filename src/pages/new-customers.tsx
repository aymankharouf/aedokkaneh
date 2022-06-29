import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Customer, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'


const NewCustomers = () => {
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const newCustomers = useMemo(() => stateCustomers.filter(c => c.status === 'n').sort((u1, u2) => u2.time > u1.time ? 1 : -1), [stateCustomers])
  return(
    <IonPage>
      <Header title={labels.newCustomers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {newCustomers.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : newCustomers.map(u => 
              <IonItem key={u.id} routerLink={`/approve-customer/${u.id}`}>
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

export default NewCustomers
