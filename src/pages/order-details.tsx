import { useState, useMemo } from 'react'
import { updateOrderStatus, getMessage, quantityDetails, setDeliveryTime } from '../data/actions'
import labels from '../data/labels'
import { colors } from '../data/config'
import { Customer, Err, Order, Pack, PackPrice, State, Store } from '../data/types'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
const OrderDetails = () => {
  const params = useParams<Params>()
  const stateArchivedOrders = useSelector<State, Order[]>(state => state.archivedOrders)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const order = useMemo(() => params.type === 'a' ? stateArchivedOrders.find(o => o.id === params.id)! : stateOrders.find(o => o.id === params.id)!, [stateArchivedOrders, stateOrders, params.id, params.type])
  const [actionsOpened, setActionsOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const orderBasket = useMemo(() => order.basket.map(p => {
    const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
    return {
        ...p,
        priceNote,
      }
    })
  , [order, stateStores])
  const handleAction = (actionId: string) => {
    try{
      if (actionId === 'a' && stateCustomers.find(c => c.id === order.userId)?.status === 'n'){
        throw new Error('notApprovedUser')
      } else if (actionId === 'i') {
        alert({
          header: labels.confirmationTitle,
          message: labels.confirmationBlockUser,
          buttons: [
            {text: labels.cancel},
            {text: labels.yes, handler: () => {
              try{
                updateOrderStatus(order, actionId, statePackPrices, statePacks)
                message(labels.editSuccess, 3000)
                history.goBack()
              } catch(error) {
                const err = error as Err
                message(getMessage(location.pathname, err), 3000)
              }    
            }},
          ],
        })
      } else if (actionId === 'd') {
        updateOrderStatus(order, 'd', statePackPrices, statePacks)
        message(labels.editSuccess, 3000)
        history.goBack()
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
          {orderBasket.map(p => 
            <IonItem key={p.pack?.id}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack?.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack?.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack?.name}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceNote}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{(p.gross / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          )}
          <IonItem>
            <IonLabel>{labels.total}</IonLabel>
            <IonLabel slot="end" className="price">{(order.total / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.deliveryFees}</IonLabel>
            <IonLabel slot="end" className="price">{(order.deliveryFees / 100).toFixed(2)}</IonLabel>
          </IonItem>
          {order.fraction > 0 && 
            <IonItem>
              <IonLabel>{labels.discount}</IonLabel>
              <IonLabel slot="end" className="price">{(order.fraction / 100).toFixed(2)}</IonLabel>
            </IonItem>
          }
          <IonItem>
            <IonLabel>{labels.net}</IonLabel>
            <IonLabel slot="end" className="price">{((order.total + order.deliveryFees - order.fraction ) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          {order.profit > 0 &&
            <IonItem>
              <IonLabel>{labels.profit}</IonLabel>
              <IonLabel slot="end" className="price">{(order.profit / 100).toFixed(2)}</IonLabel>
            </IonItem>
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionsOpened(true)} color="success">
          <IonIcon ios={ellipsisVerticalOutline} /> 
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionsOpened}
        onDidDismiss={() => setActionsOpened(false)}
        buttons={[
          {
            text: labels.customerInfo,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/customer-details/${order.userId}`)
          },
          {
            text: labels.approve,
            cssClass: params.type === 'n' && ['n', 's'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('a')
          },
          {
            text: labels.suspend,
            cssClass: params.type === 'n' && ['n', 'a'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('s')
          },
          {
            text: labels.cancel,
            cssClass: params.type === 'n' && ['n', 's', 'a'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('c')
          },
          {
            text: labels.timing,
            cssClass: params.type === 'n' && order.status === 'p' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('t')
          },
          {
            text: labels.deliver,
            cssClass: params.type === 'n' && order.status === 'p' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('d')
          },
          {
            text: labels.edit,
            cssClass: params.type === 'n' && ['n', 'a', 'e', 's', 'f'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/edit-order/${order.id}/e`)
          },
          {
            text: labels.return,
            cssClass: params.type === 'n' && ['p', 'd'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/edit-order/${params.id}/r`)
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default OrderDetails
