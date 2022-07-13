import { useMemo } from 'react'
import { confirmPurchase, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { colors } from '../data/config'
import { Basket, Err, State, Stock, Store } from '../data/types'
import { useSelector, useDispatch } from 'react-redux'


const PurchaseConfirm = () => {
  const dispatch = useDispatch()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const store = useMemo(() => stateStores.find(s => s.id === stateBasket?.storeId)!, [stateStores, stateBasket])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const total = useMemo(() => stateBasket?.packs.reduce((sum, p) => sum + Math.round(p.price * (p.weight || p.quantity)), 0) || 0, [stateBasket])
  const handlePurchase = () => {
    const fraction = total - Math.floor(total / 5) * 5
    if (fraction === 0) purchase(total)
    else {
      alert({
        header: labels.enterTotalPaid,
        inputs: [
          {name: 'total', type: 'number', label: labels.total}
        ],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e: any) => purchase(Number(e.total) * 100)}
        ],
      })
    }
  }
  const purchase = (totalPaid: number) => {
    try {
      confirmPurchase(stateBasket?.packs!, store.id!, stateStocks, totalPaid)
      message(labels.purchaseSuccess, 3000)
      history.push('/')
      dispatch({type: 'CLEAR_BASKET'})    
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${labels.confirmPurchase} ${stateBasket ? store.name : ''}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stateBasket?.packs?.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack?.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack?.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack?.name}</IonText>
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
export default PurchaseConfirm
