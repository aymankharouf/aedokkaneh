import { useRef, useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, orderStatus } from '../data/config'
import { getArchivedOrders, getMessage } from '../data/actions'
import { Customer, Err, MonthlyOperation, Order, State } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { repeatOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

const OrderArchived = () => {
  const dispatch = useDispatch()
  const stateMonthlyOperations = useSelector<State, MonthlyOperation[]>(state => state.monthlyOperations)
  const stateArchivedOrders = useSelector<State, Order[]>(state => state.archivedOrders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const monthlyOperations = useMemo(() => stateMonthlyOperations.sort((t1, t2) => t2.id - t1.id), [stateMonthlyOperations])
  const lastMonth = useRef(0)
  const [message] = useIonToast()
  const location = useLocation()
  const orders = useMemo(() => stateArchivedOrders.map(o => {
                                                    const customerInfo = stateCustomers.find(c => c.id === o.userId)!
                                                    return {
                                                      ...o,
                                                      customerInfo
                                                    }
                                                  })
                                                  .sort((o1, o2) => o2.lastUpdate > o1.lastUpdate ? 1 : -1)  
  , [stateArchivedOrders, stateCustomers])
  const handleRetreive = () => {
    try{
      const id = monthlyOperations[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const orders = getArchivedOrders(id)
      if (orders.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_ORDERS', payload: orders})
      }
      lastMonth.current++
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={labels.archivedOrders} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : orders.map(o => 
              <IonItem key={o.id} routerLink={`/order-info/${o.id}/a`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{o.customerInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{orderStatus.find(s => s.id === o.status)?.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(o.lastUpdate).fromNow()}</IonText>
                </IonLabel>
              </IonItem>   
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleRetreive} color="success">
          <IonIcon ios={repeatOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default OrderArchived
