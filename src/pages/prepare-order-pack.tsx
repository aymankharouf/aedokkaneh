import { useMemo } from 'react'
import { getMessage, returnPack, quantityDetails, completeOrderPack } from '../data/actions'
import labels from '../data/labels'
import { Basket, Err, Order, Pack, PackPrice, Purchase, State, Stock, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBadge, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { cartOutline, checkmarkOutline, reloadOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import IonAlert from './ion-alert'
import moment from 'moment'

type Params = {
  orderId: string,
  packId: string,
}
type ExtendedPackPrice = PackPrice & {
  pack: Pack,
  store: Store
}
const PrepareOrderPack = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const order = useMemo(() => stateOrders.find(o => o.id === params.orderId)!, [stateOrders, params.orderId])
  const pack = useMemo(() => statePacks.find(p => p.id === params.packId)!, [statePacks, params.packId])
  const orderPack = useMemo(() => order.basket.find(p => p.pack?.id === params.packId)!, [order, params.packId])
  const stock = useMemo(() => stateStocks.find(s => s.id === pack.id), [stateStocks, pack])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const packStores = useMemo(() => statePackPrices.filter(p => p.packId === pack.id || statePacks.find(pa => pa.id === p.packId && pa.product.id === pack.product.id && pa.isOffer))
                                                  .map(p => ({
                                                    ...p,
                                                    store: stateStores.find(s => s.id === p.storeId)!,
                                                    pack: statePacks.find(pp => pp.id === p.packId)!
                                                  }))
                                                .sort((s1, s2) => 
                                                {
                                                  if (s1.price === s2.price) {
                                                    const store1Purchases = statePurchases.filter(p => p.storeId === s1.storeId && p.time >= moment().subtract(1, 'month').toDate())
                                                    const store2Purchases = statePurchases.filter(p => p.storeId === s2.storeId && p.time >= moment().subtract(1, 'month').toDate())
                                                    const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
                                                    const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
                                                    return store1Sales - store2Sales
                                                  } else {
                                                    return s1.price - s2.price
                                                  }
                                                })
  , [pack, stateStores, statePackPrices, statePurchases, statePacks])
  const handleAddWithWeight = (packStore: ExtendedPackPrice, quantity: number, weight: number) => {
    try{
      dispatch({type: 'ADD_TO_BASKET', payload: {...packStore, quantity, weight}})
      message(labels.addToBasketSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }   
  }
  const addToBasket = (packStore: ExtendedPackPrice) => {
    try {
      if (packStore.pack.quantityType === 'wc') {
        alert({
          header: labels.enterWeight,
          inputs: [
            {name: 'quantity', type: 'number', label: labels.quantity},
            {name: 'weight', type: 'number', label: labels.weight}
          ],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => handleAddWithWeight(packStore, Number(e.quantity), Number(e.weight))}
          ],
        })
      } else if (packStore.pack.quantityType === 'wo') {
        alert({
          header: labels.enterWeight,
          inputs: [
            {name: 'weight', type: 'number', label: labels.weight}
          ],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => handleAddWithWeight(packStore, Number(e.weight), Number(e.weight))}
          ],
        })
      } else {
        dispatch({type: 'ADD_TO_BASKET', payload: {...packStore, quantity: orderPack.quantity - (stock?.quantity || 0), weight: 0}})
        message(labels.addToBasketSuccess, 3000)
        history.goBack()  
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
	const handlePurchase = (packStore: ExtendedPackPrice) => {
    try{
      if (stateBasket?.storeId && stateBasket.storeId !== packStore.storeId){
        throw new Error('twoDiffStores')
      }
      if (stateBasket?.packs?.find(p => p.pack.id === packStore.packId)) {
        throw new Error('alreadyInBasket')
      }
      addToBasket(packStore)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleComplete = async () => {
    try {
      let flag: boolean, overPricedPermission: boolean
      flag = (stock?.quantity || 0) >= orderPack.quantity || (await IonAlert(alert, labels.unAvailableConfirmation))
      overPricedPermission = ((stock?.price || 0) <= orderPack.price) || (await IonAlert(alert, labels.overPricedPermission))
      if (!overPricedPermission && !(await IonAlert(alert, labels.withLostPermission))) {
        flag = false
      }
      if (flag) {
        if (pack.quantityType !== 'c') {
          alert({
            header: labels.enterWeight,
            inputs: [{name: 'weight', type: 'number'}],
            buttons: [
              {text: labels.cancel},
              {text: labels.ok, handler: (e) => {
                completeOrderPack(pack, order, Number(e.weight), overPricedPermission, stock)
                message(labels.executeSuccess, 3000)
                history.goBack()       
              }}
            ],
          })
        } else {
          completeOrderPack(pack, order, 0, overPricedPermission, stock)
          message(labels.executeSuccess, 3000)
          history.goBack() 
        }  
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleReturn = async () => {
    try {
      if (await IonAlert(alert, labels.confirmationText)) {
        returnPack(pack, order, stateStocks)
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  let i = 0
  return (
    <IonPage>
      <Header title={pack.product.name} />
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="card-title">
                {pack.name}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={pack.product.imageUrl || '/no-image.webp'} alt={labels.noImage} style={{margin: 'auto'}}/>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{`${labels.orderPrice}: ${(orderPack.price / 100).toFixed(2)}`}</IonCol>
              <IonCol className="ion-text-end">{`${labels.stockPrice}: ${((stock?.price || 0) / 100).toFixed(2)}`}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{quantityDetails(orderPack)}</IonCol>
              <IonCol className="ion-text-end">{`${labels.stockQuantity}: ${stock?.quantity || 0}`}{stock?.weight && stock.weight !== stock.quantity ? `, ${labels.weight} : ${stock.weight}` : ''}</IonCol>
            </IonRow>
            {orderPack.actual > 0 &&
              <IonRow>
                <IonCol>{`${labels.purchasePrice}: ${(orderPack.actual / 100).toFixed(2)}`}</IonCol>
              </IonRow>
            }
          </IonGrid>
        </IonCard>
        <IonList>
          {packStores.map(s => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{s.store.name}</IonText>
                <IonText style={{color: colors[1].name}}>{s.packId === pack.id ? '' : s.pack.name} {s.pack.isOffer && <IonBadge>{labels.offer}</IonBadge>}</IonText>
                <IonText style={{color: colors[2].name}}>
                  {`${labels.price}: ${(s.price / 100).toFixed(2)}`} {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
                </IonText>
              </IonLabel>
              {orderPack.status === 'n' && 
                <IonIcon 
                  ios={cartOutline}
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handlePurchase(s)}
                />
              }
            </IonItem>   
          )}
        </IonList>
      </IonContent>
      {['a', 'e', 's', 'f'].includes(order.status) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => ['s', 'f'].includes(order.status) ? handleReturn() : (orderPack.status === 'n' ? handleComplete() : handleReturn())} color="success">
            <IonIcon ios={['s', 'f'].includes(order.status) ? reloadOutline : (orderPack.status === 'n' ? checkmarkOutline : reloadOutline)} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}

export default PrepareOrderPack
