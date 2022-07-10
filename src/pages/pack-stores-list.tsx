import { useState, useMemo } from 'react'
import { getPackStores, deleteStorePack, deletePack, changeStorePackStatus, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { Basket, Err, Order, Pack, PackPrice, Purchase, State, Stock, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  id: string
}
type ExtendedPackPrice = {
  packPrice: PackPrice,
  subCount: number,
  unitPrice: number,
  isOffer: boolean,
  pack: Pack,
  store: Store
}
const PackStores = () => {
  const params = useParams<Params>()
  const dispatch = useDispatch()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const [currentStorePack, setCurrentStorePack] = useState<ExtendedPackPrice>()
  const [priceActionOpened, setPriceActionOpened] = useState(false)
  const [packActionOpened, setPackActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const stock = useMemo(() => stateStocks.find(s => s.id === params.id), [stateStocks, params.id])
  const detailsCount = useMemo(() => {
    const detailsCount = statePackPrices.filter(p => p.packId === pack.id).length
    return detailsCount === 0 ? stateOrders.filter(o => o.basket.find(p => p.pack.id === pack.id)).length : detailsCount
  }, [pack, stateOrders, statePackPrices])
  const packStores = useMemo(() => {
    const packStores = getPackStores(pack, statePackPrices, statePacks)
    const result = packStores.map(p => {
      const pack = statePacks.find(pp => pp.id === p.packPrice.packId)!
      const store = stateStores.find(s => s.id === p.packPrice.storeId)!
      return {
        ...p,
        pack,
        store
      }
    })
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return result.sort((s1, s2) => 
    {
      if (s1.unitPrice === s2.unitPrice) {
        const store1Purchases = statePurchases.filter(p => p.storeId === s1.packPrice.storeId && p.time < today)
        const store2Purchases = statePurchases.filter(p => p.storeId === s2.packPrice.storeId && p.time < today)
        const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
        const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
        return store1Sales - store2Sales
      } else {
        return s1.unitPrice - s2.unitPrice
      }
    })
  }, [pack, stateStores, statePackPrices, statePurchases, statePacks])
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            deletePack(pack.id!)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleDeletePrice = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            if (!currentStorePack) return
            deleteStorePack(currentStorePack.packPrice, statePackPrices, statePacks)
            message(labels.deleteSuccess, 3000)
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleWeight = (weight: number) => {
    const params = {
      pack,
      packStore: currentStorePack,
      quantity : pack.quantityType === 'wo' ? weight : 1,
      price: currentStorePack?.packPrice.price,
      weight,
    }
    dispatch({type: 'ADD_TO_BASKET', payload: params})
    message(labels.addToBasketSuccess, 3000)
    history.goBack()
  }
  const handlePurchase = () => {
		try{
			if (stateBasket?.storeId && stateBasket.storeId !== currentStorePack?.packPrice.storeId){
				throw new Error('twoDiffStores')
      }
      if (stateBasket?.packs?.find(p => p.pack.id === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      let params
      if (pack.quantityType !== 'c') {
        alert({
          header: labels.enterWeight,
          inputs: [{name: 'weight', type: 'number'}],
          buttons: [
            {text: labels.cancel},
            {text: labels.ok, handler: (e) => handleWeight(e.weight)}
          ],
        })
      } else {
        params = {
          pack, 
          packStore: currentStorePack,
          quantity: 1,
          price: currentStorePack?.packPrice.price,
          weight: 0,
          orderId: '',
          refPackId: '',
          refPackQuantity: 0,
          exceedPriceType: ''
        }
        dispatch({type: 'ADD_TO_BASKET', payload: params})
        message(labels.addToBasketSuccess, 3000)
        history.goBack()
      }
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleChangeStatus = () => {
    try{
      if (!currentStorePack) return
      changeStorePackStatus(currentStorePack.packPrice, statePackPrices, statePacks)
      message(labels.editSuccess, 3000)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  const handleActions = (storePackInfo: ExtendedPackPrice) => {
    const storePack = {
      ...storePackInfo,
      packId: pack.id!
    }
    setCurrentStorePack(storePack)
    setPriceActionOpened(true)
  }
  let i = 0
  return (
    <IonPage>
      <Header title={labels.prices} />
      <IonContent fullscreen>
      <IonList>
          <IonItem>
            <IonLabel>{labels.product}</IonLabel>
            <IonInput 
              value={`${pack.product.name}${pack.product.alias ? '-' + pack.product.alias : ''}`} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel>{labels.pack}</IonLabel>
            <IonInput 
              value={pack.name} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel>{labels.price}</IonLabel>
            <IonInput 
              value={(pack.price / 100).toFixed(2)} 
              type="text"
              readonly
            />
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader style={{fontSize: '0.9rem'}} color="primary" mode="ios">
            <IonLabel>{labels.stock}</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>{labels.price}</IonLabel>
            <IonInput 
              value={((stock?.price || 0) / 100).toFixed(2)} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel>{labels.quantity}</IonLabel>
            <IonInput 
              value={quantityText(stock?.quantity || 0, stock?.weight)} 
              type="text"
              readonly
            />
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader style={{fontSize: '0.9rem'}} color="primary">
            <IonLabel>{labels.stores}</IonLabel>
          </IonListHeader>
          {packStores.map(s => 
            <IonItem key={i++} className={currentStorePack?.packPrice.storeId === s.packPrice.storeId && currentStorePack?.packPrice.packId === s.packPrice.packId ? 'selected' : ''}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{s.store.name}</IonText>
                <IonText style={{color: colors[1].name}}>{s.packPrice.packId === pack.id ? '' : `${s.pack.product.name}${s.pack.product.alias ? '-' + s.pack.product.alias : ''}`}</IonText>
                <IonText style={{color: colors[2].name}}>{s.packPrice.packId === pack.id ? '' : s.pack.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(s.packPrice.price / 100).toFixed(2)}${s.packPrice.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`} {!s.packPrice.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}</IonText>
                <IonText style={{color: colors[4].name}}>{s.subCount ? `${labels.quantity}: ${s.subCount}` : ''}</IonText>
              </IonLabel>
              {s.packPrice.packId === pack.id &&
                <IonIcon 
                  ios={ellipsisVerticalOutline}
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleActions(s)}
                  />
              }
            </IonItem>    
          )}
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton onClick={() => setPackActionOpened(true)}>
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={priceActionOpened}
        onDidDismiss={() => setPriceActionOpened(false)}
        buttons={[
          {
            text: currentStorePack?.packPrice.isActive ? labels.deactivate : labels.activate,
            cssClass: colors[i++ % 10].name,
            handler: () => handleChangeStatus()
          },
          {
            text: labels.editPrice,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/edit-price/${currentStorePack?.packPrice.packId}/${currentStorePack?.packPrice.storeId}`)
          },
          {
            text: labels.delete,
            cssClass: colors[i++ % 10].name,
            handler: () => handleDeletePrice()
          },
          {
            text: labels.purchase,
            cssClass: colors[i++ % 10].name,
            handler: () => handlePurchase()
          },
        ]}
      />
      <IonActionSheet
        mode='ios'
        isOpen={packActionOpened}
        onDidDismiss={() => setPackActionOpened(false)}
        buttons={[
          {
            text: labels.addPrice,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/add-pack-store/${params.id}`)
          },
          {
            text: labels.edit,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/${pack.subPackId ? 'edit-offer' : 'edit-pack'}/${params.id}`)
          },
          {
            text: labels.operations,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/pack-operations/${params.id}`)
          },
          {
            text: labels.delete,
            cssClass: detailsCount === 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDelete()
          },

        ]}
      />

      <Footer />
    </IonPage>
  )
}

export default PackStores
