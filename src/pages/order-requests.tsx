import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { orderStatus, orderRequestTypes, colors } from '../data/config'
import { CustomerInfo, Order } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'

type ExtendedOrder = Order & {
  customerInfo: CustomerInfo
} 
const OrderRequests = () => {
  const { state } = useContext(StateContext)
  const [orderRequests, setOrderRequests] = useState<ExtendedOrder[]>([])
  useEffect(() => {
    setOrderRequests(() => {
      const requests = state.orders.filter(r => r.requestType)
      const result = requests.map(r => {
        const customerInfo = state.customers.find(c => c.id === r.userId)!
        return {
          ...r,
          customerInfo
        }
      })
      return result.sort((r1, r2) => (r2.requestTime || new Date()) > (r1.requestTime || new Date()) ? 1 : -1)
    })
  }, [state.orders, state.customers])
  return(
    <IonPage>
      <Header title={labels.orderRequests} />
      <IonContent fullscreen>
        <IonList>
          {orderRequests.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : orderRequests.map(r => 
              <IonItem key={r.id} routerLink={`/order-request-details/${r.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.customerInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{orderStatus.find(s => s.id === r.status)?.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${labels.type}: ${orderRequestTypes.find(t => t.id === r.requestType)?.name}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{moment(r.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(r.total / 100).toFixed(2)}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default OrderRequests
