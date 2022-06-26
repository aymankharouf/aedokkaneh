import { useEffect, useMemo } from 'react'
import { updateOrderStatus, editOrder, getMessage, quantityDetails, returnOrder } from '../data/actions'
import labels from '../data/labels'
import { Err, Order, OrderBasketPack, Pack, PackPrice, Region, State, UserInfo } from '../data/types'
import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons'
import { useHistory, useLocation } from 'react-router'
import { colors } from '../data/config'
import { useSelector, useDispatch } from 'react-redux'

type Props = {
  id: string,
  type: string
}
type ExtendedOrderBasketPack = OrderBasketPack & {
  packInfo: Pack
}
const EditOrder = (props: Props) => {
  const dispatch = useDispatch()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const stateOrderBasket = useSelector<State, OrderBasketPack[] | undefined>(state => state.orderBasket)
  const order = useMemo(() => stateOrders.find(o => o.id === props.id)!, [stateOrders, props.id])
  const hasChanged = useMemo(() => stateOrderBasket?.find(p => p.oldQuantity !== p.quantity) ? true : false, [stateOrderBasket])
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
  const orderBasket = useMemo(() => stateOrderBasket?.filter(p => p.quantity > 0)
                                                      .map(p => {
                                                        const packInfo = statePacks.find(pa => pa.id === p.packId)!
                                                        return {
                                                          ...p,
                                                          packInfo
                                                        }
                                                      })
  , [stateOrderBasket, statePacks])
  const total = useMemo(() => orderBasket?.reduce((sum, p) => sum + p.gross, 0) || 0, [orderBasket])
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
            updateOrderStatus(order, type, statePackPrices, statePacks, false)
            message(labels.deleteSuccess, 3000)
            dispatch({type: 'CLEAR_ORDER_BASKET'})
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleSubmit = () => {
    try{
      if (props.type === 'e') {
        editOrder(order, stateOrderBasket!, statePackPrices, statePacks)
      } else {
        const userRegion = stateUsers.find(c => c.id === order.userId)?.regionId
        const regionFees = stateRegions.find(r => r.id === userRegion)?.fees || 0
        returnOrder(order, stateOrderBasket!, regionFees, statePackPrices, statePacks)
      }
      message(labels.editSuccess, 3000)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      history.goBack()
    } catch(error) {
      const err = error as Err
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
          {orderBasket?.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          :orderBasket?.map(p =>
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
