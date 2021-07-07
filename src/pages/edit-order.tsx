import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { updateOrderStatus, editOrder, getMessage, quantityDetails, returnOrder } from '../data/actions'
import labels from '../data/labels'
import { OrderBasketPack, Pack } from '../data/types'
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons'
import { useHistory, useLocation } from 'react-router'
import { colors } from '../data/config'

type Props = {
  id: string,
  type: string
}
type ExtendedOrderBasketPack = OrderBasketPack & {
  packInfo: Pack
}
const EditOrder = (props: Props) => {
  const { state, dispatch } = useContext(StateContext)
  const [order] = useState(() => state.orders.find(o => o.id === props.id)!)
  const [orderBasket, setOrderBasket] = useState<ExtendedOrderBasketPack[]>([])
  const [total, setTotal] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()

  useEffect(() => {
    const basket = order.basket.map(p => {
      return {
        ...p,
        quantity: props.type === 'e' ? p.quantity : p.purchased,
        oldQuantity: props.type === 'e' ? p.quantity : p.purchased
      }
    })
    dispatch({type: 'LOAD_ORDER_BASKET', payload: basket})
  }, [dispatch, order, props.type])
  useEffect(() => {
    setOrderBasket(() => {
      const orderBasket = state.orderBasket?.filter(p => p.quantity > 0) || []
      return orderBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
    })
  }, [state.orderBasket, state.packs])
  useEffect(() => {
    setHasChanged(() => state.orderBasket?.find(p => p.oldQuantity !== p.quantity) ? true : false)
  }, [state.orderBasket])
  useEffect(() => {
    setTotal(() => orderBasket.reduce((sum, p) => sum + p.gross, 0))
  }, [orderBasket])
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
            updateOrderStatus(order, type, state.packPrices, state.packs, false)
            message(labels.deleteSuccess, 3000)
            dispatch({type: 'CLEAR_ORDER_BASKET'})
            history.goBack()
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleSubmit = () => {
    try{
      if (props.type === 'e') {
        editOrder(order, state.orderBasket!, state.packPrices, state.packs)
      } else {
        const userRegion = state.users.find(c => c.id === order.userId)?.regionId
        const regionFees = state.regions.find(r => r.id === userRegion)?.fees || 0
        returnOrder(order, state.orderBasket!, regionFees, state.packPrices, state.packs)
      }
      message(labels.editSuccess, 3000)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleIncrease = (pack: ExtendedOrderBasketPack) => {
    if (props.type === 'e' || (props.type === 'r' && pack.quantity < pack.oldQuantity)) {
      dispatch({type: 'INCREASE_ORDER_QUANTITY', payload: pack})
    }
  }
  const handleDecrease = (pack: ExtendedOrderBasketPack) => {
    const params = {
      type: props.type,
      pack
    }
    dispatch({type: 'DECREASE_ORDER_QUANTITY', payload: params})
  }
  return (
    <IonPage>
      <Header title={props.type === 'e' ? labels.editOrder : labels.returnOrder} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {orderBasket.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          :orderBasket.map(p =>
            <IonItem key={p.packId}>
              <IonThumbnail slot="start">
                <IonImg src={p.imageUrl} alt={labels.noImage} />
              </IonThumbnail>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${((p.actual || p.price) / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.grossPrice}: ${(p.gross / 100).toFixed(2)}`}</IonText>
              </IonLabel>
                <IonButtons slot="end" onClick={() => handleDecrease(p)}>
                  <IonIcon 
                    ios={removeOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
                <IonButtons slot="end" onClick={() => handleIncrease(p)}>
                  <IonIcon 
                    ios={addOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
            </IonItem>
          )}
        </IonList>
      </IonContent>
      {hasChanged && 
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            onClick={handleSubmit}
          >
            {`${labels.submit} ${(total / 100).toFixed(2)}`}
          </IonButton>
        </div>    
      }
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete} color="danger">
          <IonIcon ios={trashOutline} /> 
        </IonFabButton>
      </IonFab>    
    </IonPage>
  )
}
export default EditOrder
