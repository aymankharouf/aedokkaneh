import { useMemo } from 'react'
import { confirmPurchase, stockOut, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { colors } from '../data/config'
import { Basket, Err, Order, Pack, PackPrice, State, Store } from '../data/types'
import { useSelector, useDispatch } from 'react-redux'


const ConfirmPurchase = () => {
  const dispatch = useDispatch()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const store = useMemo(() => stateStores.find(s => s.id === stateBasket?.storeId)!, [stateStores, stateBasket])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const basket = useMemo(() => stateBasket?.packs.map(p => {
    const packInfo = statePacks.find(pa => pa.id === p.packId)!
    return {
      ...p,
      packInfo,
    }
  }), [stateBasket, statePacks])
  const total = useMemo(() => stateBasket?.packs.reduce((sum, p) => sum + Math.round(p.price * (p.weight || p.quantity)), 0) || 0, [stateBasket])
  const handlePurchase = () => {
    try{
      if (store.id === 's') {
        stockOut(stateBasket?.packs!, stateOrders, statePackPrices, statePacks)
        message(labels.purchaseSuccess, 3000)
        history.push('/')
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        confirmPurchase(stateBasket?.packs!, stateOrders, store.id!, statePackPrices, statePacks, stateStores, total)
        message(labels.purchaseSuccess, 3000)
        history.push('/')
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${labels.confirmPurchase} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {basket?.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{((p.price * (p.weight || p.quantity)) / 100).toFixed(2)}</IonLabel>
            </IonItem>   
        
          )}
          <IonItem>
            <IonLabel>{labels.total}</IonLabel>
            <IonLabel slot="end" className="price">{(total / 100).toFixed(2)}</IonLabel>
          </IonItem>
         </IonList>
      </IonContent>
      <div className="ion-text-center">
        <IonButton 
          fill="solid" 
          shape="round"
          color="secondary"
          style={{width: '10rem'}}
          onClick={handlePurchase}
        >
          {labels.submit}
        </IonButton>
      </div>

    </IonPage>
  )
}
export default ConfirmPurchase
