import { useMemo } from 'react'
import labels from '../data/labels'
import { orderStatus, colors } from '../data/config'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { cloudUploadOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Order, State } from '../data/types'
import firebase from '../data/firebase'

const Orders = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const orderStatuses = useMemo(() => orderStatus.map(s => {
    const orders = stateOrders.filter(o => o.status === s.id).length
    return {
      ...s,
      count: orders
    }
  }), [stateOrders])
  const orderRequests = useMemo(() => stateOrders.filter(o => o.requestType).length, [stateOrders])
  const finishedOrders = useMemo(() => stateOrders.filter(o => o.status === 'f').length, [stateOrders])
  let i = 0
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={labels.orders} />
      <IonContent fullscreen>
				<IonList>
          <IonItem routerLink="/order-requests"> 
            <IonLabel>{labels.orderRequests}</IonLabel>
            <IonBadge color={colors[i++ % 10].name}>{orderRequests}</IonBadge>
          </IonItem>
          <IonItem routerLink="/prepare-orders"> 
            <IonLabel>{labels.prepareOrders}</IonLabel>
            <IonBadge color={colors[i++ % 10].name}>{finishedOrders}</IonBadge>
          </IonItem>
          {orderStatuses.map(s => 
            <IonItem key={s.id} routerLink={`/orders-list/${s.id}/s`}> 
              <IonLabel>{s.name}</IonLabel>
              <IonBadge color={colors[i++ % 10].name}>{s.count}</IonBadge>
            </IonItem>
          )}
				</IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/archived-orders" color="success">
          <IonIcon ios={cloudUploadOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Orders
