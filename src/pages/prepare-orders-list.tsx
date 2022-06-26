import { useMemo } from 'react'
import { allocateOrderPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { CustomerInfo, Err, Order, OrderBasketPack, Pack, State } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  packId: string,
  orderId: string
}
type ExtendedOrder = Order & {
  customerInfo: CustomerInfo,
  basketInfo: OrderBasketPack
}
const PrepareOrdersList = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const pack = useMemo(() => statePacks.find(p => p.id === params.packId)!, [statePacks, params.packId])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const orders = useMemo(() => stateOrders.filter(o => o.id === params.orderId || (params.orderId === '0' && o.status === 'f' && o.basket.find(p => p.packId === params.packId && !p.isAllocated)))
                                          .map(o => {
                                              const customerInfo = stateCustomers.find(c => c.id === o.userId)!
                                              const basketInfo = o.basket.find(p => p.packId === params.packId)!
                                              return {
                                                ...o,
                                                customerInfo,
                                                basketInfo
                                              }
                                            })
                                            .sort((o1, o2) => o2.time > o1.time ? 1 : -1)
  , [stateOrders, stateCustomers, params.orderId, params.packId])
  const handleAllocate = (order: ExtendedOrder) => {
    try{
      allocateOrderPack(order, pack)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
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
