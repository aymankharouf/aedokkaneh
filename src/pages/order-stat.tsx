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

const OrderStat = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const orderStatuses = useMemo(() => orderStatus.map(s => {
    const orders = stateOrders.filter(o => o.status === s.id).length
    return {
      ...s,
      count: orders
    }
  }), [stateOrders])
  let i = 0
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={labels.orders} />
      <IonContent fullscreen>
				<IonList>
          {orderStatuses.map(s => 
            <IonItem key={s.id} routerLink={`/order-list/${s.id}/s`}> 
              <IonLabel>{s.name}</IonLabel>
              <IonBadge color={colors[i++ % 10].name}>{s.count}</IonBadge>
            </IonItem>
          )}
				</IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/order-archived" color="success">
          <IonIcon ios={cloudUploadOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default OrderStat
