import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { updateOrderStatus, getMessage, quantityDetails, mergeOrder, setDeliveryTime } from '../data/actions'
import labels from '../data/labels'
import { colors, orderPackStatus } from '../data/config'
import { Order, OrderBasketPack } from '../data/types'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { constructOutline } from 'ionicons/icons'

type Params = {
  id: string,
  type: string
}
type ExtendedOrderBasketPack = OrderBasketPack & {
  storeName: string,
  priceNote: string,
  statusNote: string
}
const OrderDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [order, setOrder] = useState(() => params.type === 'a' ? state.archivedOrders.find(o => o.id === params.id)! : state.orders.find(o => o.id === params.id)!)
  const [orderBasket, setOrderBasket] = useState<ExtendedOrderBasketPack[]>([])
  const [lastOrder, setLastOrder] = useState<Order>()
  const [actionsOpened, setActionsOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  useEffect(() => {
    setOrder(() => state.orders.find(o => o.id === params.id)!)
  }, [state.orders, params.id])
  useEffect(() => {
    setOrderBasket(() => order.basket.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId)?.name || '') : ''
      const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
      const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
      return {
        ...p,
        storeName,
        priceNote,
        statusNote
      }
    }))
  }, [order, state.stores])
  useEffect(() => {
    setLastOrder(() => {
      const userOrders = state.orders.filter(o => o.id !== order.id && o.userId === order.userId && !['c', 'm', 'r'].includes(o.status))
      userOrders.sort((o1, o2) => o2.time > o1.time ? 1 : -1)
      return ['a', 'e'].includes(userOrders[0]?.status) ? userOrders[0] : undefined
    })
  }, [state.orders, order])
  const confirmMerge = () => {
    try{
      let found
      for (let p of order.basket) {
        found = lastOrder!.basket.find(bp => bp.packId === p.packId)
        if (found && found.price !== p.price) {
          throw new Error('samePackWithDiffPrice')
        }
        if (found && found.weight > 0 && state.packs.find(pa => pa.id === p.packId)?.isDivided) {
          throw new Error('samePackPurchasedByWeight')
        }
      }
      mergeOrder(lastOrder!, order.basket, order.id!)
      message(labels.mergeSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const rejectMerge = (actionId: string) => {
    try{
      updateOrderStatus(order, actionId, state.packPrices, state.packs, false)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleAction = (actionId: string) => {
    try{
    if (actionId === 'a' && !state.customers.find(c => c.id === order.userId)){
        throw new Error('notApprovedUser')
      } else if (actionId === 'a' && lastOrder) {
        alert({
          header: labels.confirmationTitle,
          message: labels.confirmMergeText,
          buttons: [
            {text: labels.cancel, handler: () => rejectMerge(actionId)},
            {text: labels.yes, handler: () => confirmMerge()},
          ],
        })
      } else if (actionId === 'i') {
        alert({
          header: labels.confirmationTitle,
          message: labels.confirmationBlockUser,
          buttons: [
            {text: labels.cancel},
            {text: labels.yes, handler: () => {
              try{
                updateOrderStatus(order, actionId, state.packPrices, state.packs, false)
                message(labels.editSuccess, 3000)
                history.goBack()
              } catch(err) {
                message(getMessage(location.pathname, err), 3000)
              }    
            }},
          ],
        })
      } else if (actionId === 'd') {
        updateOrderStatus(order, 'd', state.packPrices, state.packs, false)
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
              } catch(err) {
                message(getMessage(location.pathname, err), 3000)
              }
            }}
          ],
        })
      } else {
        updateOrderStatus(order, actionId, state.packPrices, state.packs, false)
        message(labels.editSuccess, 3000)
        history.goBack()
      }  
    } catch(err) {
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
            <IonItem key={p.packId}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceNote}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
                <IonText style={{color: colors[5].name}}>{p.storeId ? `${labels.storeName}: ${p.storeName}` : ''}</IonText>
                <IonText style={{color: colors[6].name}}>{`${labels.status}: ${p.statusNote}`}</IonText>
              </IonLabel>
              {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              <IonLabel slot="end" className="price">{(p.gross / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          )}
          <IonItem>
            <IonLabel>{labels.total}</IonLabel>
            <IonLabel slot="end" className="price">{(order.total / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.fixedFees}</IonLabel>
            <IonLabel slot="end" className="price">{((order.fixedFees + order.deliveryFees) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.discount}</IonLabel>
            <IonLabel slot="end" className="price">{((order.discount.value + order.fraction) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.net}</IonLabel>
            <IonLabel slot="end" className="price">{((order.total + order.fixedFees + order.deliveryFees - order.discount.value - order.fraction ) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          {order.profit &&
            <IonItem>
              <IonLabel>{labels.profit}</IonLabel>
              <IonLabel slot="end" className="price">{(order.profit / 100).toFixed(2)}</IonLabel>
            </IonItem>
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionsOpened(true)} color="success">
          <IonIcon ios={constructOutline} /> 
        </IonFabButton>
      </IonFab>
      <IonActionSheet
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
            text: labels.reject,
            cssClass: params.type === 'n' && ['n', 's'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('r')
          },
          {
            text: labels.cancel,
            cssClass: params.type === 'n' && ['n', 's', 'a'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('c')
          },
          {
            text: labels.insert,
            cssClass: params.type === 'n' && ['f', 'e', 'p'].includes(order.status) ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAction('i')
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
