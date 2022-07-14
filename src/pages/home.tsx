import { useMemo } from 'react'
import { colors } from '../data/config'
import labels from '../data/labels'
import Footer from './footer'
import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useSelector } from 'react-redux'
import { Customer, Order, State } from '../data/types'

const Home = () => {
  const mainPages = useMemo(() => [
    {id: '2', name: labels.stores, path: '/store-list'},
    {id: '3', name: labels.products, path: '/product-list/0'},
    {id: '4', name: labels.purchases, path: '/purchase-list'},
    {id: '5', name: labels.stock, path: '/stock'},
    {id: '6', name: labels.spendings, path: '/spending-list'},
    {id: '7', name: labels.notifications, path: '/notification-list'}
  ], [])
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const orders = useMemo(() => stateOrders.filter(o => ['n', 'a', 'e', 's', 'f'].includes(o.status)), [stateOrders])
  const newCustomers = useMemo(() => stateCustomers.filter(c => c.status === 'n'), [stateCustomers])
  let i = 0
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-5px'}} /></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-15px'}} /></IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton
          routerLink="/prepare-order-list" 
          expand="block"
          shape="round"
          className={colors[i++ % 10].name}
          style={{margin: '0.9rem'}}
        >
          {`${labels.orders} (${orders.length})`}
        </IonButton>
        <IonButton
          routerLink="/customer-list" 
          expand="block"
          shape="round"
          className={colors[i++ % 10].name}
          style={{margin: '0.9rem'}}
        >
          {`${labels.customers} (${newCustomers.length})`}
        </IonButton>
        {mainPages.map(p => 
          <IonButton
            routerLink={p.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}}
            key={p.id}
          >
            {p.name}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Home
