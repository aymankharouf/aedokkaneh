import { useMemo, useState } from 'react'
import { getMessage, quantityDetails, setDeliveryTime, updateOrderStatus } from '../data/actions'
import labels from '../data/labels'
import { colors } from '../data/config'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { Customer, Err, Order, Pack, PackPrice, State } from '../data/types'
import { useSelector } from 'react-redux'
import { ellipsisVerticalOutline, flashOffOutline, flashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const PrepareOrder = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  const [packActionOpened, setPackActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const handleAction = (actionId: string) => {
    try{
      if (actionId === 'a' && stateCustomers.find(c => c.id === order.userId)?.status === 'n'){
        throw new Error('notApprovedUser')
      } else if (actionId === 't') {
        alert({
          header: labels.enterDeliveryTime,
          inputs: [{name: 'deliveryTime', type: 'text'}],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => {
              try{
                setDeliveryTime(order.id!, e.deliveryTime)
                message(labels.editSuccess, 3000)
                history.goBack()
              } catch(error) {
                const err = error as Err
                message(getMessage(location.pathname, err), 3000)
              }
            }}
          ],
        })
      } else {
        updateOrderStatus(order, actionId, statePackPrices, statePacks)
        message(labels.editSuccess, 3000)
        history.goBack()
      }  
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }

  let i = 0
  return(
    <IonPage>
      <Header title={labels.orderDetails} />
      <IonContent fullscreen>
        <IonList>
          {order.basket.map(p => 
            <IonItem key={p.pack?.id} routerLink={`/prepare-order-pack/${order.id}/${p.pack?.id}`}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack?.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack?.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack?.name}</IonText>
                <IonText style={{color: colors[3].name}}>{quantityDetails(p)}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.gross}: ${(p.gross / 100).toFixed(2)}`}</IonText>
              </IonLabel>
              {p.status !== 'n' && 
                <IonLabel slot="end">
                  <IonIcon ios={p.status === 'e' ? flashOutline : flashOffOutline} size="large" />
                </IonLabel>
              }
            </IonItem>    
           )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setPackActionOpened(true)} color="success">
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={packActionOpened}
        onDidDismiss={() => setPackActionOpened(false)}
        buttons={[
          {
            text: labels.customerInfo,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/customer-details/${order.userId}`)
          },
          {
            text: labels.orderTrans,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/order-trans/${order.id}`)
          },
          {
            text: labels.approve,
            cssClass: ['n', 's'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('a')
          },
          {
            text: labels.suspend,
            cssClass: ['n', 'a', 'e'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('s')
          },
          {
            text: labels.cancel,
            cssClass: order.status !== 'f' || order.total === 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('c')
          },
          {
            text: labels.timing,
            cssClass: order.total > 0 && order.status === 'f' && !order.deliveryTime ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('t')
          },
          {
            text: labels.deliver,
            cssClass: order.total > 0 && order.status === 'f' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('d')
          },
          {
            text: labels.edit,
            cssClass: order.status !== 'f' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/edit-order/${order.id}`)
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default PrepareOrder
