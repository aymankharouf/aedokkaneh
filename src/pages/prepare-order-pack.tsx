import { useMemo } from 'react'
import { packUnavailable, getMessage, getPackStores, returnPack } from '../data/actions'
import labels from '../data/labels'
import { Basket, Err, Order, Pack, PackPrice, Purchase, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBadge, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline, reloadOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import IonAlert from './ion-alert'

type Params = {
  orderId: string,
  packId: string,
}
type ExtendedPackPrice = {
  packPrice: PackPrice,
  subCount: number,
  unitPrice: number,
  isOffer: boolean,
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
  const order = useMemo(() => stateOrders.find(o => o.id === params.orderId)!, [stateOrders, params.orderId])
  const pack = useMemo(() => statePacks.find(p => p.id === params.packId)!, [statePacks, params.packId])
  const orderPack = useMemo(() => order.basket.find(p => p.pack?.id === params.packId)!, [order, params.packId])
  const stock = useMemo(() => statePackPrices.find(p => p.storeId === 's' && p.packId === pack.id), [statePackPrices, pack])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const packStores = useMemo(() => {
    const packStores = getPackStores(pack, statePackPrices, statePacks)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.map(p => {
        const store = stateStores.find(s => s.id === p.packPrice.storeId)!
        const pack = statePacks.find(pp => pp.id === p.packPrice.packId)!
        return {
          ...p,
          store,
          pack
        }
      })
      .sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          const store1Purchases = statePurchases.filter(p => p.storeId === s1.packPrice.storeId && p.time >= today)
          const store2Purchases = statePurchases.filter(p => p.storeId === s2.packPrice.storeId && p.time >= today)
          const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
          const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
          return store1Sales - store2Sales
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
  }, [pack, stateStores, statePackPrices, statePurchases, statePacks])
  const handleAddWithWeight = (packStore: ExtendedPackPrice, exceedPriceType: string, weight: number) => {
    try{
      // if (packStore.pack.isDivided && packStore.store.id === 's' && packStore.packPrice.quantity < Number(weight)) {
      //   throw new Error('quantityNotAvaliable')
      // }
      const basketItem = {
        packStore,
        // refPackId: params.packId,
        // refPackQuantity: 1,
        quantity: pack.isDivided ? Number(weight) : orderPack.quantity,
        price: orderPack.price,
        // requested: Number(params.quantity),
        weight: Number(weight),
        // exceedPriceType
      }
      dispatch({type: 'ADD_TO_BASKET', payload: basketItem})
      message(labels.addToBasketSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }   
  }
  const addToBasket = (packStore: ExtendedPackPrice, exceedPriceType: string) => {
    try {
      let quantity, basketItem
      if (packStore.pack.byWeight) {
        alert({
          header: labels.enterWeight,
          inputs: [{name: 'weight', type: 'number'}],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => handleAddWithWeight(packStore, exceedPriceType, e.weight)}
          ],
        })
      } else {
        if (packStore.subCount) {
          quantity = Math.ceil(orderPack.quantity / packStore.subCount)
        } else {
          quantity = orderPack.quantity
        }
        basketItem = {
          packStore,
          quantity,
        }
        dispatch({type: 'ADD_TO_BASKET', payload: basketItem})
        message(labels.addToBasketSuccess, 3000)
        history.goBack()  
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
	const handlePurchase = async (packStore: ExtendedPackPrice) => {
    try{
      if (stateBasket?.storeId && stateBasket.storeId !== packStore.packPrice.storeId){
        throw new Error('twoDiffStores')
      }
      if (stateBasket?.packs?.find(p => p.packId === packStore.packPrice.packId)) {
        throw new Error('alreadyInBasket')
      }
      if (orderPack.price >= packStore.unitPrice) {
        addToBasket(packStore, 'n')
      } else {
        if (await IonAlert(alert, labels.overPricedPermission)) addToBasket(packStore, 'p')
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleApprove = async () => {
    try {
      let flag: boolean, overPricedPermission: boolean
      flag = (stock?.quantity || 0) >= orderPack.quantity || (await IonAlert(alert, labels.unAvailableConfirmation))
      overPricedPermission = ((stock?.price || 0) <= orderPack.price) || (await IonAlert(alert, labels.overPricedPermission))
      if (!overPricedPermission && !(await IonAlert(alert, labels.withLostPermission))) {
        flag = false
      }
      if (flag) {
        if (pack.byWeight) {
          alert({
            header: labels.enterWeight,
            inputs: [{name: 'weight', type: 'number'}],
            buttons: [
              {text: labels.cancel},
              {text: labels.ok, handler: (e) => {
                packUnavailable(pack, order, statePackPrices, stock, e.weight, overPricedPermission)
              }}
            ],
          })
        } else {
          packUnavailable(pack, order, statePackPrices, stock, undefined, overPricedPermission)
        }  
        message(labels.executeSuccess, 3000)
        history.goBack() 
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleReturn = async () => {
    try {
      if (await IonAlert(alert, labels.confirmationText)) {
        returnPack(pack, order, statePackPrices)
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
      <IonContent fullscreen>
        <IonCard>
        <IonGrid>
            <IonRow>
              <IonCol className="card-title">
                {pack.name}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={pack.product.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{`${labels.orderPrice}: ${(orderPack.price / 100).toFixed(2)}`}</IonCol>
              <IonCol className="ion-text-end">{`${labels.quantity}: ${orderPack.quantity}`}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{`${labels.stockPrice}: ${((stock?.price || 0) / 100).toFixed(2)}`}</IonCol>
              <IonCol className="ion-text-end">{`${labels.stockQuantity}: ${stock?.quantity || 0}`}{stock?.weight ? `, ${labels.weight} : ${stock.weight}` : ''}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
        <IonList>
          {packStores.map(s => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{s.store.name}</IonText>
                <IonText style={{color: colors[1].name}}>{s.packPrice.packId === pack.id ? '' : `${s.pack.product.name}${s.pack.product.alias ? '-' + s.pack.product.alias : ''}`}</IonText>
                <IonText style={{color: colors[2].name}}>{s.packPrice.packId === pack.id ? '' : s.pack.name}</IonText>
                <IonText style={{color: colors[3].name}}>
                  {`${labels.price}: ${(s.packPrice.price / 100).toFixed(2)}${s.packPrice.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`} {!s.packPrice.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
                </IonText>
                {s.subCount > 0 && 
                  <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${s.subCount}`}</IonText>
                }
                {s.packPrice.quantity > 0 && 
                  <IonText style={{color: colors[5].name}}>{`${labels.stockQuantity}: ${s.packPrice.weight || s.packPrice.quantity}`}</IonText>
                }
              </IonLabel>
              <IonIcon 
                ios={checkmarkOutline}
                slot="end" 
                color="danger"
                style={{fontSize: '20px', marginRight: '10px'}} 
                onClick={()=> handlePurchase(s)}
                />
            </IonItem>   
          )}
        </IonList>
      </IonContent>
      {['a', 'e', 's', 'f'].includes(order.status) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => ['s', 'f'].includes(order.status) ? handleReturn() : (orderPack.isDone ? handleReturn() : handleApprove())} color="success">
            <IonIcon ios={['s', 'f'].includes(order.status) ? reloadOutline : (orderPack.isDone ? reloadOutline : checkmarkOutline)} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}

export default PrepareOrderPack
