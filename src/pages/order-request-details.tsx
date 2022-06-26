import { useMemo, useState } from 'react'
import { getMessage, quantityDetails, approveOrderRequest, addQuantity } from '../data/actions'
import labels from '../data/labels'
import { colors, orderPackStatus, orderRequestTypes } from '../data/config'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Order, Pack, PackPrice, State, Store } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const OrderRequestDetails = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const [order] = useState(() => stateOrders.find(o => o.id === params.id)!)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const orderBasket = useMemo(() => {
    const basket = order.basket.slice().map(p => {
                                          return {
                                            ...p,
                                            change: 0
                                          }
                                        })
    order.requestBasket.forEach(p => {
      const index = basket.findIndex(bp => bp.packId === p.packId)
      if (index === -1) {
        basket.push({
          ...p,
          change: p.quantity
        })
      } else {
        basket.splice(index, 1, {
          ...basket[index],
          quantity: p.quantity,
          change: addQuantity(p.quantity, -1 * basket[index].quantity)
        })
      }
    })
    return basket.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : stateStores.find(s => s.id === p.storeId)?.name) : ''
      const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
      const changeQuantityNote = p.change === 0 ? '' : p.change > 0 ? `${labels.increase} ${p.change}` : `${labels.decrease} ${-1 * p.change}`
      return {
        ...p,
        storeName,
        statusNote,
        changeQuantityNote,
      }
    })
  }, [order, stateStores])
  const total = useMemo(() => orderBasket.reduce((sum, p) => sum + p.price * p.quantity, 0), [orderBasket])
  const fraction = useMemo(() => total - Math.floor(total / 5) * 5, [total])
  const handleApprove = () => {
    try{
      approveOrderRequest(order, stateOrders, statePackPrices, statePacks)
      message(labels.approveSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return(
    <IonPage>
      <Header title={`${labels.request} ${orderRequestTypes.find(t => t.id === order.requestType)?.name}`} />
      <IonContent fullscreen>
        <IonList>
          {orderBasket.map(p => 
            <IonItem key={p.packId}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{quantityDetails(p)}</IonText>
                {p.changeQuantityNote && <IonText style={{color: colors[4].name}}>{`${labels.requestedChange}: ${p.changeQuantityNote}`}</IonText>}
                <IonText style={{color: colors[5].name}}>{p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}</IonText>
                <IonText style={{color: colors[6].name}}>{`${labels.status}: ${p.statusNote}`}</IonText>
              </IonLabel>
              {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              <IonLabel slot="end" className="price">{(p.gross / 100).toFixed(2)}</IonLabel>
            </IonItem>    
           )}
          <IonItem>
            <IonLabel>{labels.total}</IonLabel>
            <IonLabel slot="end" className="price">{(total / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.deliveryFees}</IonLabel>
            <IonLabel slot="end" className="price">{(order.deliveryFees / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.discount}</IonLabel>
            <IonLabel slot="end" className="price">{(fraction / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.net}</IonLabel>
            <IonLabel slot="end" className="price">{((total + order.deliveryFees - fraction) / 100).toFixed(2)}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleApprove} color="success">
          <IonIcon ios={checkmarkOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default OrderRequestDetails
