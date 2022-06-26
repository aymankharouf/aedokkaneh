import { useEffect, useMemo, useState } from 'react'
import labels from '../data/labels'
import { confirmReturnBasket, getMessage, quantityText } from '../data/actions'
import { stockOperationTypes } from '../data/config'
import { Err, Order, Pack, PackPrice, Purchase, ReturnBasket as ReturnBasketType, State, StockOperation, Store } from '../data/types'
import { useHistory, useLocation } from 'react-router'
import { IonBadge, IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { trashOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector, useDispatch } from 'react-redux'

const ReturnBasket = () => {
  const dispatch = useDispatch()
  const stateReturnBasket = useSelector<State, ReturnBasketType | undefined>(state => state.returnBasket)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const store = useMemo(() => stateStores.find(s => s.id === stateReturnBasket?.storeId), [stateStores, stateReturnBasket])
  const [storeId, setStoreId] = useState('')
  const stores = useMemo(() => stateStores.filter(s => s.id !== 's'), [stateStores])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const basket = useMemo(() => stateReturnBasket?.packs.map(p => {
    const packInfo = statePacks.find(pa => pa.id === p.packId)!
    return {
      ...p,
      packInfo
    }
  })
  , [stateReturnBasket, statePacks])
  const totalPrice = useMemo(() => stateReturnBasket?.packs?.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0) || 0, [stateReturnBasket])
  useEffect(() => {
    if (!stateReturnBasket) history.push('/')
  }, [stateReturnBasket, history])
  const handleSubmit = () => {
    try{
      const packs = stateReturnBasket!.packs.slice()
      const returnBasket = {
        ...stateReturnBasket!,
        packs
      }
      confirmReturnBasket(returnBasket, storeId || stateReturnBasket!.storeId, stateOrders, stateStockOperations, statePackPrices, statePacks, statePurchases, stateStores)
      dispatch({type: 'CLEAR_RETURN_BASKET'})
      message(labels.executeSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0  
  return (
    <IonPage>
      <Header title={`${labels.basket} ${stockOperationTypes.find(t => t.id === stateReturnBasket?.type)?.name} ${store?.name || ''}`} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket?.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.grossPrice}: ${(Math.round(p.cost * p.quantity) / 100).toFixed(2)}`}</IonText>
                {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              </IonLabel>
              <IonButtons slot="end" onClick={() => dispatch({type: 'REMOVE_FROM_RETURN_BASKET', payload: p})}>
                <IonIcon 
                  ios={trashOutline} 
                  color="danger" 
                />
              </IonButtons>
            </IonItem>
          )}
        </IonList>
        <IonList>
          {stateReturnBasket?.type === 's' &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.store}
              </IonLabel>
              <IonSelect 
                ok-text={labels.ok} 
                cancel-text={labels.cancel} 
                value={storeId}
                onIonChange={e => setStoreId(e.detail.value)}
              >
                {stores.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          }
        </IonList>
      </IonContent>
      {(stateReturnBasket?.type !== 's' || storeId) &&
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            onClick={handleSubmit}
          >
            {`${labels.submit} ${(totalPrice / 100).toFixed(2)}`}
          </IonButton>
        </div>
      }
    </IonPage>
  )
}
export default ReturnBasket
