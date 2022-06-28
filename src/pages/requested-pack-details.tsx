import { useMemo } from 'react'
import { packUnavailable, getMessage, addQuantity, getPackStores } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'
import { Basket, Err, Order, Pack, PackPrice, Purchase, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBadge, IonCard, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  packId: string,
  orderId: string,
  quantity: string,
  price: string
}
type ExtendedPackPrice = PackPrice & {
  subQuantity: number,
  unitPrice: number,
  isOffer: boolean,
  packInfo: Pack,
  storeInfo: Store
}
const RequestedPackDetails = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const pack = useMemo(() => statePacks.find(p => p.id === params.packId)!, [statePacks, params.packId])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const basketStockQuantity = useMemo(() => {
    const basketStock = stateBasket?.storeId === 's' ? stateBasket?.packs.find(p => p.packId === params.packId || statePacks.find(pa => pa.id === p.packId && pa.subPackId === params.packId)) : undefined
    return ((basketStock?.quantity || 0) * (basketStock?.refQuantity || 0)) || 0
  }, [stateBasket, statePacks, params.packId])
  const packStores = useMemo(() => {
    const packStores = getPackStores(pack, statePackPrices, statePacks, basketStockQuantity)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.map(p => {
        const storeInfo = stateStores.find(s => s.id === p.storeId)!
        const packInfo = statePacks.find(pp => pp.id === p.packId)!
        return {
          ...p,
          storeInfo,
          packInfo
        }
      })
      .sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          const store1Purchases = statePurchases.filter(p => p.storeId === s1.storeId && p.time >= today)
          const store2Purchases = statePurchases.filter(p => p.storeId === s2.storeId && p.time >= today)
          const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
          const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
          return store1Sales - store2Sales
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
  }, [pack, stateStores, statePackPrices, statePurchases, basketStockQuantity, statePacks])
  const handleAddWithWeight = (packStore: ExtendedPackPrice, exceedPriceType: string, weight: number) => {
    try{
      if (packStore.packInfo.isDivided && packStore.storeId === 's' && packStore.quantity < Number(weight)) {
        throw new Error('quantityNotAvaliable')
      }
      const basketItem = {
        pack: packStore.packInfo,
        packStore,
        refPackId: params.packId,
        refPackQuantity: 1,
        quantity: pack.isDivided ? Number(weight) : Number(params.quantity),
        price: Number(params.price),
        requested: Number(params.quantity),
        orderId: params.orderId,
        weight: Number(weight),
        exceedPriceType
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
      if (packStore.packInfo.byWeight) {
        alert({
          header: labels.enterWeight,
          inputs: [{name: 'weight', type: 'number'}],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => handleAddWithWeight(packStore, exceedPriceType, e.weight)}
          ],
        })
      } else {
        if (packStore.subQuantity) {
          quantity = Math.ceil(Number(params.quantity) / packStore.subQuantity)
        } else {
          quantity = Number(params.quantity)
        }
        if (packStore.storeId === 's') {
          quantity = Math.min(quantity, packStore.quantity)
        }
        basketItem = {
          pack: packStore.packInfo,
          packStore,
          refPackId: params.packId,
          refPackQuantity: packStore.subQuantity || 1,
          quantity,
          price: Number(params.price),
          exceedPriceType
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
	const handlePurchase = (packStore: ExtendedPackPrice) => {
    try{
      if (stateBasket?.storeId && stateBasket.storeId !== packStore.storeId){
        throw new Error('twoDiffStores')
      }
      const packInfo = statePacks.find(p => p.id === packStore.packId)!
      if (packInfo.byWeight){
        if (stateBasket?.packs?.find(p => p.packId === packInfo.id && p.orderId === params.orderId)) {
          throw new Error('alreadyInBasket')
        }
      } else {
        if (stateBasket?.packs?.find(p => p.packId === packInfo.id)) {
          throw new Error('alreadyInBasket')
        }
      }
      if (Number(params.price) >= packStore.unitPrice) {
        addToBasket(packStore, 'n')
      } else {
        if (Number(params.price) >= pack.price) {
          alert({
            header: labels.confirmationTitle,
            message: labels.priceHigherThanRequested,
            buttons: [
              {text: labels.cancel},
              {text: labels.yes, handler: () => addToBasket(packStore, 'o')},
            ],
          })
        } else {
          alert({
            header: labels.permissionTitle,
            message: labels.overPricedPermission,
            buttons: [
              {text: labels.cancel},
              {text: labels.yes, handler: () => addToBasket(packStore, 'p')},
            ],
          })
        }
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleUnavailable = (overPriced: boolean) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            const approvedOrders = stateOrders.filter(o => ['a', 'e'].includes(o.status))
            packUnavailable(pack, Number(params.price), approvedOrders, overPriced)
            message(labels.executeSuccess, 3000)
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={pack.productName} />
      <IonContent fullscreen>
        <IonCard>
        <IonGrid>
            <IonRow>
              <IonCol className="card-title">
                {`${pack.name} ${pack.closeExpired ? '(' + labels.closeExpired + ')' : ''}`}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={pack.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{`${labels.orderPrice}: ${(Number(params.price) / 100).toFixed(2)}, ${labels.current}: ${(pack.price / 100).toFixed(2)}`}</IonCol>
              <IonCol className="ion-text-end">{`${labels.quantity}: ${params.quantity}`}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
        <IonList>
          {pack.price === 0 && 
            <IonItem detail onClick={() => handleUnavailable(false)}>
              <IonLabel>{labels.overPriced}</IonLabel>
            </IonItem>   
          }
          {Number(params.price) > 0 && Number(params.price) < pack.price && 
            <IonItem detail onClick={() => handleUnavailable(true)}>
              <IonLabel>{labels.overPriced}</IonLabel>
            </IonItem>   
          }
          {packStores.map(s => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{s.storeInfo.name}</IonText>
                <IonText style={{color: colors[1].name}}>{s.packId === pack.id ? '' : `${s.packInfo.productName}${s.packInfo.productAlias ? '-' + s.packInfo.productAlias : ''}`}</IonText>
                <IonText style={{color: colors[2].name}}>{s.packId === pack.id ? '' : s.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(s.price / 100).toFixed(2)}${s.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`}</IonText>
                <IonText style={{color: colors[4].name}}>{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</IonText>
                {s.offerEnd && <IonText style={{color: colors[5].name}}>{labels.offerUpTo}: {moment(s.offerEnd).format('Y/M/D')}</IonText>}
                <IonText style={{color: colors[6].name}}>{addQuantity(s.quantity, -1 * basketStockQuantity) > 0 ? `${labels.balance}: ${addQuantity(s.quantity, -1 * basketStockQuantity)}` : ''}</IonText>
                {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonLabel>
              {s.isActive &&
                <IonIcon 
                  ios={checkmarkOutline}
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
      <Footer />
    </IonPage>
  )
}

export default RequestedPackDetails
