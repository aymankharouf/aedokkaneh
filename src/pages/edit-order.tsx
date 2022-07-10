import { useMemo, useState } from 'react'
import { editOrder, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { Err, Order, OrderPack, Pack, PackPrice, State } from '../data/types'
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { addOutline, removeOutline } from 'ionicons/icons'
import { useHistory, useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
}
const EditOrder = () => {
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  const [basket, setBasket] = useState(() => order.basket.map(p => ({...p, oldQuantity: p.quantity})))
  const hasChanged = useMemo(() => !!basket.find(p => p.oldQuantity !== p.quantity), [basket])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  
  const total = useMemo(() => basket.reduce((sum, p) => sum + p.gross, 0), [basket])
  const handleIncrease = (orderPack: OrderPack) => {
    const increment = [0.125, 0.25, 0.5, 0.75, 1]
    let nextQuantity, i, packIndex, basketPack
    if (orderPack.pack?.isDivided) {
      if (orderPack.quantity >= 1) {
        nextQuantity = orderPack.quantity + 0.5
      } else {
        i = increment.indexOf(orderPack.quantity)
        nextQuantity = increment[++i]  
      }
    } else {
      nextQuantity = orderPack.quantity + 1
    }
    basketPack = {
      ...orderPack,
      quantity: nextQuantity,
      gross: Math.round((orderPack.actual || orderPack.price) * nextQuantity)
    }
    const packs = basket.slice()
    if (!packs) return
    packIndex = packs.findIndex(p => p.pack?.id === orderPack.pack?.id)
    packs.splice(packIndex, 1, basketPack)  
    setBasket(packs)
  }
  const handleDecrease = (orderPack: OrderPack) => {
    const increment = [0.125, 0.25, 0.5, 0.75, 1]
    let nextQuantity, i, packIndex, basketPack
    if (orderPack.weight) {
      nextQuantity = 0
    } else if (orderPack.pack?.isDivided) {
      if (orderPack.quantity > 1) {
        nextQuantity = orderPack.quantity - 0.5
      } else {
        i = increment.indexOf(orderPack.quantity)
        nextQuantity = i === 0 ? increment[0] : increment[--i]  
      }
    } else {
      nextQuantity = orderPack.quantity - 1
    }
    basketPack = {
      ...orderPack,
      quantity: nextQuantity,
      gross: Math.round((orderPack.actual || orderPack.price) * nextQuantity)
    }  
    const packs = basket.slice()
    if (!packs) return
    packIndex = packs.findIndex(p => p.pack?.id === orderPack.pack?.id)
    packs.splice(packIndex, 1, basketPack)  
    setBasket(packs)
  }

  const handleSubmit = () => {
    try{
      editOrder(order, basket, statePackPrices, statePacks)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editOrder} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          :basket.map(p =>
            <IonItem key={p.pack?.id}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack?.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack?.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack?.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${((p.actual || p.price) / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.grossPrice}: ${(p.gross / 100).toFixed(2)}`}</IonText>
              </IonLabel>
              {p.status === 'n' && <>
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
              </>}
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
    </IonPage>
  )
}
export default EditOrder
