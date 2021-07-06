import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors } from '../data/config'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'

type Section = {
  id: string,
  name: string,
  path: string,
  count: number
}
const Approvals = () => {
  const { state } = useContext(StateContext)
  const [newOrders, setNewOrders] = useState(0)
  const [orderRequests, setOrderRequests] = useState(0)
  const [newUsers, setNewUsers] = useState(0)
  const [alarms, setAlarms] = useState(0)
  const [passwordRequests, setPasswordRequests] = useState(0)
  const [ratings, setRatings] = useState(0)
  const [invitations, setInvitations] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [newOwners, setNewOwners] = useState(0)
  useEffect(() => {
    setNewOrders(() => state.orders.filter(o => o.status === 'n').length)
    setOrderRequests(() => state.orders.filter(r => r.requestType).length)
  }, [state.orders])
  useEffect(() => {
    setNewUsers(() => state.users.filter(u => !state.customers.find(c => c.id === u.id)).length)
    setAlarms(() => state.alarms.filter(a => a.status === 'n').length)
    setRatings(() => state.ratings.filter(r => r.status === 'n').length)
    setInvitations(() => state.invitations.filter(i => i.status === 'n').length)
    setNewOwners(() => state.customers.filter(c => c.storeName && !c.storeId).length)
  }, [state.users, state.customers, state.alarms, state.ratings, state.invitations])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests.length)
  }, [state.passwordRequests]) 
  useEffect(() => {
    setSections(() => [
      {id: '1', name: labels.orders, path: '/orders-list/n/s', count: newOrders},
      {id: '2', name: labels.orderRequests, path: '/order-requests/', count: orderRequests},
      {id: '3', name: labels.newUsers, path: '/new-users/', count: newUsers},
      {id: '4', name: labels.alarms, path: '/alarms/', count: alarms},
      {id: '5', name: labels.passwordRequests, path: '/password-requests/', count: passwordRequests},
      {id: '6', name: labels.ratings, path: '/ratings/', count: ratings},
      {id: '7', name: labels.invitations, path: '/invitations/', count: invitations},
      {id: '8', name: labels.newOwners, path: '/permission-list/n', count: newOwners},
    ])
  }, [newOrders, newUsers, alarms, passwordRequests, ratings, orderRequests, invitations, newOwners])
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
