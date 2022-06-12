import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { confirmReturnBasket, getMessage, quantityText } from '../data/actions'
import { stockOperationTypes } from '../data/config'
import { Err, Pack, StockPack } from '../data/types'
import { useHistory, useLocation } from 'react-router'
import { IonBadge, IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { trashOutline } from 'ionicons/icons'
import { colors } from '../data/config'

type ExtendedStockPack = StockPack & {
  packInfo: Pack
}
const ReturnBasket = () => {
  const { state, dispatch } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.returnBasket?.storeId))
  const [basket, setBasket] = useState<ExtendedStockPack[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [storeId, setStoreId] = useState('')
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  useEffect(() => {
    setBasket(() => {
      const basket = state.returnBasket?.packs || []
      return basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
    })
    setTotalPrice(() => state.returnBasket?.packs?.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.returnBasket, state.packs])
  useEffect(() => {
    if (!state.returnBasket) history.push('/')
  }, [state.returnBasket, history])
  const handleSubmit = () => {
    try{
      const packs = state.returnBasket!.packs.slice()
      const returnBasket = {
        ...state.returnBasket!,
        packs
      }
      confirmReturnBasket(returnBasket, storeId || state.returnBasket!.storeId, state.orders, state.stockOperations, state.packPrices, state.packs, state.purchases, state.stores)
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
      <Header title={`${labels.basket} ${stockOperationTypes.find(t => t.id === state.returnBasket?.type)?.name} ${store?.name || ''}`} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.map(p => 
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
          {state.returnBasket?.type === 's' &&
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
      {(state.returnBasket?.type !== 's' || storeId) &&
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
