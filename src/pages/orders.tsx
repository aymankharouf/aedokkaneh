import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { orderStatus, colors } from '../data/config'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { cloudUploadOutline } from 'ionicons/icons'

type OrderStatus = {
  id: string,
  name: string,
  count: number
}
const Orders = () => {
  const { state } = useContext(StateContext)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [orderRequests, setOrderRequests] = useState(0)
  const [finishedOrders, setFinishedOrders] = useState(0)
  useEffect(() => {
    setOrderStatuses(() => orderStatus.map(s => {
      const orders = state.orders.filter(o => o.status === s.id).length
      return {
        ...s,
        count: orders
      }
    }))
    setOrderRequests(() => state.orders.filter(o => o.requestType).length)
    setFinishedOrders(() => state.orders.filter(o => o.status === 'f').length)
  }, [state.orders])
  let i = 0
  if (!state.user) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
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
