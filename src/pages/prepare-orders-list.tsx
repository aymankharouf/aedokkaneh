import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { allocateOrderPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { CustomerInfo, Order, OrderBasketPack } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  packId: string,
  orderId: string
}
type ExtendedOrder = Order & {
  customerInfo: CustomerInfo,
  basketInfo: OrderBasketPack
}
const PrepareOrdersList = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [pack] = useState(() => state.packs.find(p => p.id === params.packId)!)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    setOrders(() => {
      const orders = state.orders.filter(o => o.id === params.orderId || (params.orderId === '0' && o.status === 'f' && o.basket.find(p => p.packId === params.packId && !p.isAllocated)))
      const result = orders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)!
        const basketInfo = o.basket.find(p => p.packId === params.packId)!
        return {
          ...o,
          customerInfo,
          basketInfo
        }
      })
      return result.sort((o1, o2) => o2.time > o1.time ? 1 : -1)
    })
  }, [state.orders, state.customers, params.orderId, params.packId])
  const handleAllocate = (order: ExtendedOrder) => {
    try{
      allocateOrderPack(order, pack)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={`${pack.productName} ${pack.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : orders.map(o => 
              <IonItem key={o.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{o.customerInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.quantity}: ${o.basketInfo.weight || o.basketInfo.quantity}`}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={checkmarkOutline} 
                  slot="end" 
                  color="success"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleAllocate(o)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default PrepareOrdersList
