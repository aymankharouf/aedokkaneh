import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { packUnavailable, getMessage, addQuantity, getPackStores } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'
import { Err, Pack, PackPrice, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonBadge, IonCard, IonCol, IonContent, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  packId: string,
  orderId: string,
  quantity: string,
  price: string
}
type ExtendedPackPrice = PackPrice & {
  subQuantity: number,
  unitPrice: number,
  unitCost: number,
  isOffer: boolean,
  packInfo: Pack,
  storeInfo: Store
}
const RequestedPackDetails = () => {
	const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [pack] = useState(() => state.packs.find(p => p.id === params.packId)!)
  const [basketStockQuantity, setBasketStockQuantity] = useState(0)
  const [packStores, setPackStores] = useState<ExtendedPackPrice[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  useEffect(() => {
    setBasketStockQuantity(() => {
      const basketStock = state.basket?.storeId === 's' ? state.basket?.packs.find(p => p.packId === params.packId || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === params.packId || pa.bonusPackId === params.packId))) : undefined
      return ((basketStock?.quantity || 0) * (basketStock?.refQuantity || 0)) || 0
    })
  }, [state.basket, state.packs, params.packId])
  useEffect(() => {
    setPackStores(() => {
      const packStores = getPackStores(pack, state.packPrices, state.packs, basketStockQuantity)
      const today = new Date()
      today.setDate(today.getDate() - 30)
      const result = packStores.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        const packInfo = state.packs.find(pp => pp.id === p.packId)!
        return {
          ...p,
          storeInfo,
          packInfo
        }
      })
      return result.sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          if (s1.storeInfo.type === s2.storeInfo.type){
            if (s2.storeInfo.discount === s1.storeInfo.discount) {
              const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time >= today)
              const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time >= today)
              const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
              const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
              return store1Sales - store2Sales
            } else {
              return Number(s2.storeInfo.discount) - Number(s1.storeInfo.discount)
            }
          } else {
            return Number(s1.storeInfo.type) - Number(s2.storeInfo.type)
          }
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
    })
  }, [pack, state.stores, state.packPrices, state.purchases, basketStockQuantity, state.packs])
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
      } else if (packStore.isAuto) {
        const mainPackInfo = state.packs.find(p => p.subPackId === packStore.packId && !p.forSale)!
        const mainPackStore = state.packPrices.find(p => p.storeId === packStore.storeId && p.packId === mainPackInfo.id)
        quantity = Math.ceil(Number(params.quantity) / (packStore.quantity * mainPackInfo.subQuantity))
        basketItem = {
          pack: mainPackInfo,
          packStore: mainPackStore,
          refPackId: params.packId,
          refPackQuantity: mainPackInfo.subQuantity,
          quantity,
          price: Number(params.price),
          exceedPriceType
        }
        dispatch({type: 'ADD_TO_BASKET', payload: basketItem})
        message(labels.addToBasketSuccess, 3000)
        history.goBack()
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
      if (state.basket?.storeId && state.basket.storeId !== packStore.storeId){
        throw new Error('twoDiffStores')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)!
      if (packInfo.byWeight){
        if (state.basket?.packs?.find(p => p.packId === packInfo.id && p.orderId === params.orderId)) {
          throw new Error('alreadyInBasket')
        }
      } else {
        if (state.basket?.packs?.find(p => p.packId === packInfo.id)) {
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
            const approvedOrders = state.orders.filter(o => ['a', 'e'].includes(o.status))
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
                <IonText style={{color: colors[4].name}}>{`${labels.cost}: ${(s.cost / 100).toFixed(2)}${s.cost === s.unitCost ? '' : '(' + (s.unitCost / 100).toFixed(2) + ')'}`}</IonText>
                <IonText style={{color: colors[5].name}}>{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</IonText>
                {s.offerEnd && <IonText style={{color: colors[6].name}}>{labels.offerUpTo}: {moment(s.offerEnd).format('Y/M/D')}</IonText>}
                <IonText style={{color: colors[7].name}}>{addQuantity(s.quantity, -1 * basketStockQuantity) > 0 ? `${labels.balance}: ${addQuantity(s.quantity, -1 * basketStockQuantity)}` : ''}</IonText>
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
