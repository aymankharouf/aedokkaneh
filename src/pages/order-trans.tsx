import { useMemo } from 'react'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { Order, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import moment from 'moment'

type Params = {
  id: string,
}
const OrderTrans = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.orderTrans} />
      <IonContent fullscreen>
        <IonList>
          {order.trans?.map(t => 
            <IonItem key={i++}>
              <IonLabel>{orderStatus.find(s => s.id === t.type)?.name}</IonLabel>
              <IonLabel slot="end">{moment(t.time).fromNow()}</IonLabel>
            </IonItem>    
          )}
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default OrderTrans
