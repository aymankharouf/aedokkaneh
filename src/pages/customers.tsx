import { useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { CustomerInfo, State } from '../data/types'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import firebase from '../data/firebase'

const Customers = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const [customers, setCustomers] = useState<CustomerInfo[]>([])
  useEffect(() => {
    setCustomers(() => [...stateCustomers].sort((c1, c2) => c2.time > c1.time ? 1 : -1))
  }, [stateCustomers])

  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={labels.customers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {customers.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : customers.map(c => 
              <IonItem key={c.id} routerLink={`/customer-details/${c.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(c.time).fromNow()}</IonText>
                  {c.isBlocked && <IonBadge color="danger">{labels.isBlocked}</IonBadge>}
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

export default Customers
