import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { orderStatus, colors } from '../data/config'
import { Customer, Order, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

const PrepareOrdersList = () => {
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const orders = useMemo(() => stateOrders.filter(o => ['n', 'a', 'e', 's', 'f'].includes(o.status))
                                                  .map(r => {
                                                    const customer = stateCustomers.find(c => c.id === r.userId)!
                                                    return {
                                                      ...r,
                                                      customer
                                                    }
                                                  })
                                                  .sort((o1, o2) => o2.lastUpdate > o1.lastUpdate ? 1 : -1)
  , [stateOrders, stateCustomers])
  return(
    <IonPage>
      <Header title={labels.prepareOrders} />
      <IonContent fullscreen>
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : orders.map(r => 
              <IonItem key={r.id} routerLink={`/prepare-order/${r.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.customer.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{orderStatus.find(s => s.id === r.status)?.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(r.time).fromNow()}</IonText>
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

export default PrepareOrdersList
