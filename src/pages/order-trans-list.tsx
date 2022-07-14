import { useMemo } from 'react'
import labels from '../data/labels'
import { orderTransTypes } from '../data/config'
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
const OrderTransList = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  const trans = useMemo(() => order.trans.sort((t1, t2) => t2.time - t1.time), [order])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.orderTrans} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {trans.map(t => 
            <IonItem key={i++}>
              <IonLabel>{orderTransTypes.find(tt => tt.id === t.type)?.name}</IonLabel>
              <IonLabel slot="end">{moment(new Date(t.time)).fromNow()}</IonLabel>
            </IonItem>    
          )}
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default OrderTransList
