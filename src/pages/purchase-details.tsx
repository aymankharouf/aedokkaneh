import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { getMessage, quantityText } from '../data/actions'
import { Pack, Purchase, StockPack } from '../data/types'
import { IonBadge, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { refreshOutline } from 'ionicons/icons'

type Params = {
  id: string,
  type: string
}
type ExtendedStockPack = StockPack & {
  packInfo: Pack
}
const PurchaseDetails = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [purchase, setPurchase] = useState<Purchase>()
  const [purchaseBasket, setPurchaseBasket] = useState<ExtendedStockPack[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  useEffect(() => {
    setPurchase(() => params.type === 'a' ? state.archivedPurchases.find(p => p.id === params.id)! : state.purchases.find(p => p.id === params.id)!)
  }, [state.purchases, state.archivedPurchases, params.id, params.type])
  useEffect(() => {
    setPurchaseBasket(() => {
      const purchaseBasket =  purchase ? purchase.basket.filter(p => !(state.returnBasket?.purchaseId === purchase.id && state.returnBasket?.packs?.find(bp => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight)))) : []
      return purchaseBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo,
        }
      })
    })
  }, [state.packs, state.returnBasket, purchase])
  const handleReturn = (pack: ExtendedStockPack) => {
    try{
      const affectedOrders = state.orders.filter(o => o.basket.find(p => p.packId === pack.packId && p.lastPurchaseId === purchase?.id) && ['p', 'd'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      if (state.returnBasket && state.returnBasket.purchaseId !== purchase?.id) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type: 'c',
        packId: pack.packId,
        cost: pack.cost,
        price: pack.price,
        quantity: pack.quantity,
        weight: pack.weight,
        storeId: purchase!.storeId,
        purchaseId: purchase!.id
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
      message(labels.addToBasketSuccess, 3000)
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.purchaseDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {purchaseBasket.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : purchaseBasket.map(p => 
              <IonItem key={i++}>
                <IonThumbnail slot="start">
                  <img src={p.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.price}: ${(Math.round(p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}`}</IonText>
                </IonLabel>
                {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
                {params.type === 'n' &&
                  <IonIcon 
                    ios={refreshOutline} 
                    slot="end" 
                    color="danger"
                    style={{fontSize: '20px', marginRight: '10px'}} 
                    onClick={()=> handleReturn(p)}
                  />
                }
              </IonItem>    
          )}
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default PurchaseDetails
