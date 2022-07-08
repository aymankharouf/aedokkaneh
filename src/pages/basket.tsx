import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Basket as BasketType, BasketPack, PackPrice, State, Store } from '../data/types'
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { addOutline, removeOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector, useDispatch } from 'react-redux'

const Basket = () => {
  const dispatch = useDispatch()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateBasket = useSelector<State, BasketType | undefined>(state => state.basket)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const store = useMemo(() => stateStores.find(s => s.id === stateBasket?.storeId), [stateStores, stateBasket])
  const basket = useMemo(() => stateBasket?.packs || [], [stateBasket])
  const totalPrice = useMemo(() => stateBasket?.packs?.reduce((sum, p) => sum + Math.round(p.price * (p.weight || p.quantity)), 0) || 0, [stateBasket])
  // const handleIncrease = (pack: BasketPack) => {
  //   // if (store?.id === 's') {
  //   //   const stock = statePackPrices.find(p => p.packId === pack.packId && p.storeId === 's')
  //   //   if (pack.quantity === pack.requested) return
  //   //   if (pack.quantity === stock?.quantity) return
  //   // }
  //   if (pack.isDivided) return
  //   // if (pack.orderId && pack.quantity === pack.requested) return
  //   dispatch({type: 'INCREASE_QUANTITY', payload: pack})
  // }
  let i = 0  
  return (
    <IonPage>
      <Header title={store ? `${labels.basketFrom} ${store.name}` : labels.purchaseBasket} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : basket.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack?.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack?.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack?.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.grossPrice}: ${(Math.round(p.price * (p.weight || p.quantity)) / 100).toFixed(2)}`}</IonText>
              </IonLabel>
              {p.price > 0 && <>
                <IonButtons slot="end" onClick={() => dispatch({type: 'DECREASE_QUANTITY', payload: p.pack?.id})}>
                  <IonIcon 
                    ios={removeOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
                {!p.weight &&
                  <IonButtons slot="end" onClick={() => dispatch({type: 'INCREASE_QUANTITY', payload: p.pack?.id})}>
                    <IonIcon 
                      ios={addOutline} 
                      color="primary" 
                      style={{fontSize: '25px', marginRight: '5px'}} 
                    />
                  </IonButtons>
                }
              </>}
            </IonItem>
          )}
        </IonList>
      </IonContent>
      {totalPrice &&
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            routerLink="/confirm-purchase"
          >
            {`${labels.submit} ${(totalPrice / 100).toFixed(2)}`}
          </IonButton>
        </div>
      }
    </IonPage>
  )
}
export default Basket
