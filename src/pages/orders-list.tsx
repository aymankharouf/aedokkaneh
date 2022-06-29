import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, orderStatus } from '../data/config'
import { Customer, Order, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
const OrdersList = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const orders = useMemo(() => stateOrders.filter(o => (params.type === 's' && o.status === params.id) || (params.type === 'u' && o.userId === params.id))
                                          .map(o => {
                                            const customer = stateCustomers.find(c => c.id === o.userId)!
                                            return {
                                              ...o,
                                              customer
                                            }
                                          })
                                          .sort((o1, o2) => o2.time > o1.time ? 1 : -1)
  , [stateOrders, stateCustomers, params.id, params.type])

  return(
    <IonPage>
      <Header title={`${labels.orders} ${params.type === 's' ? orderStatus.find(s => s.id === params.id)?.name : stateCustomers.find(c => c.id === params.id)?.name}`} />
      <IonContent fullscreen>
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : orders.map(o => 
              <IonItem key={o.id} routerLink={`/order-details/${o.id}/n`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{params.type === 's' ? o.customer?.name : orderStatus.find(s => s.id === o.status)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{o.deliveryTime}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(o.time).fromNow()}</IonText>
                  <IonText style={{color: colors[3].name}}>{o.lastUpdate ? moment(o.lastUpdate).fromNow() : ''}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(o.total / 100).toFixed(2)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default OrdersList
