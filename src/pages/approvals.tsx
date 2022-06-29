import { useMemo } from 'react'
import labels from '../data/labels'
import { colors } from '../data/config'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { Alarm, Customer, Order, PasswordRequest, Rating, State } from '../data/types'

const Approvals = () => {
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateAlarms = useSelector<State, Alarm[]>(state => state.alarms)
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const newOrders = useMemo(() => stateOrders.filter(o => o.status === 'n').length, [stateOrders])
  const orderRequests = useMemo(() => stateOrders.filter(r => r.requestType).length, [stateOrders])
  const newCustomers = useMemo(() => stateCustomers.filter(c => c.status === 'n').length, [stateCustomers])
  const alarms = useMemo(() => stateAlarms.filter(a => a.status === 'n').length, [stateAlarms])
  const ratings = useMemo(() => stateRatings.filter(r => r.status === 'n').length, [stateRatings])
  const sections = useMemo(() => [
      {id: '1', name: labels.orders, path: '/orders-list/n/s', count: newOrders},
      {id: '2', name: labels.orderRequests, path: '/order-requests', count: orderRequests},
      {id: '3', name: labels.newCustomers, path: '/new-customers', count: newCustomers},
      {id: '4', name: labels.alarms, path: '/alarms', count: alarms},
      {id: '5', name: labels.passwordRequests, path: '/password-requests', count: statePasswordRequests.length},
      {id: '6', name: labels.ratings, path: '/ratings', count: ratings},
    ]
  , [newOrders, newCustomers, alarms, statePasswordRequests, ratings, orderRequests])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.approvals} />
      <IonContent fullscreen className="ion-padding">
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={s.id}
          >
            {`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Approvals
