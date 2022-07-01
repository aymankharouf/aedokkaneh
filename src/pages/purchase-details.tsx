import { useMemo } from 'react'
import labels from '../data/labels'
import { getMessage, quantityText } from '../data/actions'
import { Err, Order, Pack, Purchase, ReturnBasket, State, StockPack } from '../data/types'
import { IonBadge, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { refreshOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  id: string,
  type: string
}
type ExtendedStockPack = StockPack & {
  packInfo: Pack
}
const PurchaseDetails = () => {
  const params = useParams<Params>()
  const dispatch = useDispatch()
  const stateArchivedPurchases = useSelector<State, Purchase[]>(state => state.archivedPurchases)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateReturnBasket = useSelector<State, ReturnBasket | undefined>(state => state.returnBasket)
  const [message] = useIonToast()
  const location = useLocation()
  const purchase = useMemo(() => params.type === 'a' ? stateArchivedPurchases.find(p => p.id === params.id)! : statePurchases.find(p => p.id === params.id)!, [statePurchases, stateArchivedPurchases, params.id, params.type])
  const purchaseBasket = useMemo(() => purchase.basket.filter(p => !(stateReturnBasket?.purchaseId === purchase.id && stateReturnBasket?.packs?.find(bp => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight))))
                                                      .map(p => {
                                                        const packInfo = statePacks.find(pa => pa.id === p.packId)!
                                                        return {
                                                          ...p,
                                                          packInfo,
                                                        }
                                                      })
  , [statePacks, stateReturnBasket, purchase])
  const handleReturn = (pack: ExtendedStockPack) => {
    try{
      const affectedOrders = stateOrders.filter(o => o.basket.find(p => p.packId === pack.packId && p.lastPurchaseId === purchase?.id) && ['p', 'd'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      if (stateReturnBasket && stateReturnBasket.purchaseId !== purchase?.id) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type: 'c',
        packId: pack.packId,
        price: pack.price,
        quantity: pack.quantity,
        weight: pack.weight,
        storeId: purchase!.storeId,
        purchaseId: purchase!.id
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
      message(labels.addToBasketSuccess, 3000)
    } catch(error) {
      const err = error as Err
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
                  <IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.price}: ${(Math.round(p.price * (p.weight || p.quantity)) / 100).toFixed(2)}`}</IonText>
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
