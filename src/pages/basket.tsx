import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { BasketPack } from '../data/types'
import { IonBadge, IonButton, IonButtons, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory } from 'react-router'
import { addOutline, removeOutline } from 'ionicons/icons'
import { colors } from '../data/config'

const Basket = () => {
  const { state, dispatch } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.basket?.storeId))
  const [basket, setBasket] = useState<BasketPack[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const history = useHistory()
  useEffect(() => {
    if (!state.basket?.packs) history.push('/')
  }, [state.basket, history])
  useEffect(() => {
    setBasket(() => state.basket?.packs || [])
    setTotalPrice(() => state.basket?.packs?.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.basket])
  const handleIncrease = (pack: BasketPack) => {
    if (store?.id === 's') {
      const stock = state.packPrices.find(p => p.packId === pack.packId && p.storeId === 's')
      if (pack.quantity === pack.requested) return
      if (pack.quantity === stock?.quantity) return
    }
    if (pack.isDivided) return
    if (pack.orderId && pack.quantity === pack.requested) return
    dispatch({type: 'INCREASE_QUANTITY', payload: pack})
  }
  let i = 0  
  return (
    <IonPage>
      <Header title={`${labels.basketFrom} ${store?.name}`} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.map(p => 
            <IonItem key={i++}>
              <IonThumbnail slot="start">
                <IonImg src={p.imageUrl} alt={labels.noImage} />
              </IonThumbnail>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.grossPrice}: ${(Math.round(p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}`}</IonText>
                {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              </IonLabel>
              {p.price > 0 && <>
                <IonButtons slot="end" onClick={() => dispatch({type: 'DECREASE_QUANTITY', payload: p})}>
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

    </IonPage>
  )
}
export default Basket
