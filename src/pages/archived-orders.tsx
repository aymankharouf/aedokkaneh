import { useContext, useState, useEffect, useRef } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors, orderStatus } from '../data/config'
import { getArchivedOrders, getMessage } from '../data/actions'
import { CustomerInfo, Order } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { repeatOutline } from 'ionicons/icons'

type ExtendedOrder = Order & {
  customerInfo: CustomerInfo
}
const ArchivedOrders = () => {
  const { state, dispatch } = useContext(StateContext)
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [monthlyOperations] = useState(() => [...state.monthlyOperations.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  const [message] = useIonToast()
  const location = useLocation()

  useEffect(() => {
    setOrders(() => {
      const orders = state.archivedOrders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)!
        return {
          ...o,
          customerInfo
        }
      })
      return orders.sort((o1, o2) => o2.time > o1.time ? 1 : -1)  
    })
  }, [state.archivedOrders, state.customers])
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
    } catch(err) {
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
              <IonItem key={o.id} routerLink={`/order-details/${o.id}/a`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{o.customerInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{orderStatus.find(s => s.id === o.status)?.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(o.time).fromNow()}</IonText>
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

export default ArchivedOrders
