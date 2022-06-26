import { useState, useMemo } from 'react'
import { getPackStores, deleteStorePack, refreshPackPrice, deletePack, changeStorePackStatus, getMessage, quantityText } from '../data/actions'
import moment from 'moment'
import labels from '../data/labels'
import { Basket, Err, Order, Pack, PackPrice, Purchase, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { addOutline, chevronDownOutline, ellipsisVerticalOutline, pencilOutline, repeatOutline, swapVerticalOutline, trashOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  id: string
}
type ExtendedPackPrice = PackPrice & {
  subQuantity: number,
  unitPrice: number,
  unitCost: number,
  isOffer: boolean,
  packInfo: Pack,
  storeInfo: Store
}
const PackDetails = () => {
  const params = useParams<Params>()
  const dispatch = useDispatch()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const [currentStorePack, setCurrentStorePack] = useState<ExtendedPackPrice>()
  const [actionOpened, setActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const detailsCount = useMemo(() => {
    const detailsCount = statePackPrices.filter(p => p.packId === pack.id).length
    return detailsCount === 0 ? stateOrders.filter(o => o.basket.find(p => p.packId === pack.id)).length : detailsCount
  }, [pack, stateOrders, statePackPrices])
  const packStores = useMemo(() => {
    const packStores = getPackStores(pack, statePackPrices, statePacks)
      const result = packStores.map(p => {
        const packInfo = statePacks.find(pp => pp.id === p.packId)!
        const storeInfo = stateStores.find(s => s.id === p.storeId)!
        return {
          ...p,
          packInfo,
          storeInfo
        }
      })
      const today = new Date()
      today.setDate(today.getDate() - 30)
      return result.sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          const store1Purchases = statePurchases.filter(p => p.storeId === s1.storeId && p.time < today)
          const store2Purchases = statePurchases.filter(p => p.storeId === s2.storeId && p.time < today)
          const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
          const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
          return store1Sales - store2Sales
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
    }, [pack, stateStores, statePackPrices, statePurchases, statePacks])
  const handleRefreshPrice = () => {
    try{
      refreshPackPrice(pack, statePackPrices)
      message(labels.refreshSuccess, 3000)
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
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
            deleteStorePack(currentStorePack, statePackPrices, statePacks)
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
      quantity : pack.isDivided ? weight : 1,
      price: currentStorePack?.price,
      weight,
    }
    dispatch({type: 'ADD_TO_BASKET', payload: params})
    message(labels.addToBasketSuccess, 3000)
    history.goBack()
  }
  const handlePurchase = () => {
		try{
      if (currentStorePack?.offerEnd && new Date() > currentStorePack.offerEnd) {
        throw new Error('offerEnded')
      }
			if (stateBasket?.storeId && stateBasket.storeId !== currentStorePack?.storeId){
				throw new Error('twoDiffStores')
      }
      if (stateBasket?.packs?.find(p => p.packId === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      let params
      if (pack.byWeight) {
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
          price: currentStorePack?.price,
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
      changeStorePackStatus(currentStorePack, statePackPrices, statePacks)
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
    setActionOpened(true)
  }
  let i = 0
  return (
    <IonPage>
      <Header title={`${pack.productName}${pack.productAlias ? '-' + pack.productAlias : ''}`} />
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
              <IonCol>{(pack.price / 100).toFixed(2)}</IonCol>
              <IonCol className="ion-text-end">{pack.unitsCount}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
        <IonList>
          {packStores.map(s => 
            <IonItem key={i++} className={currentStorePack?.storeId === s.storeId && currentStorePack?.packId === s.packId ? 'selected' : ''}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{s.storeInfo.name}</IonText>
                <IonText style={{color: colors[1].name}}>{s.packId === pack.id ? '' : `${s.packInfo.productName}${s.packInfo.productAlias ? '-' + s.packInfo.productAlias : ''}`}</IonText>
                <IonText style={{color: colors[2].name}}>{s.packId === pack.id ? '' : s.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(s.price / 100).toFixed(2)}${s.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.cost}: ${(s.cost / 100).toFixed(2)}${s.cost === s.unitCost ? '' : '(' + (s.unitCost / 100).toFixed(2) + ')'}`}</IonText>
                <IonText style={{color: colors[5].name}}>{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</IonText>
                {s.offerEnd && <IonText style={{color: colors[6].name}}>{labels.offerUpTo}: {moment(s.offerEnd).format('Y/M/D')}</IonText>}
                {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
                {s.quantity > 0 && <IonText style={{color: colors[7].name}}>{`${labels.balance}: ${quantityText(s.quantity, s.weight)}`}</IonText>}
              </IonLabel>
              {s.packId === pack.id && !s.isAuto &&
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
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/add-pack-store/${params.id}`}>
            <IonIcon ios={addOutline} />
          </IonFabButton>
          <IonFabButton color="secondary" routerLink={`/${pack.isOffer ? 'edit-offer' : (pack.subPackId ? 'edit-bulk' : 'edit-pack')}/${params.id}`}>
            <IonIcon ios={pencilOutline} />
          </IonFabButton>
          <IonFabButton color="warning" onClick={() => handleRefreshPrice()}>
            <IonIcon ios={repeatOutline} />
          </IonFabButton>
          <IonFabButton color="tertiary" routerLink={`/pack-operations/${params.id}`}>
            <IonIcon ios={swapVerticalOutline} />
          </IonFabButton>
          {detailsCount === 0 &&
            <IonFabButton color="danger" onClick={() => handleDelete()}>
              <IonIcon ios={trashOutline} />
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: currentStorePack?.isActive ? labels.deactivate : labels.activate,
            cssClass: currentStorePack?.storeId !== 's' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleChangeStatus()
          },
          {
            text: labels.editPrice,
            cssClass: currentStorePack?.storeId !== 's' || currentStorePack?.quantity > 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/edit-price/${currentStorePack?.packId}/${currentStorePack?.storeId}`)
          },
          {
            text: labels.delete,
            cssClass: currentStorePack?.storeId !== 's' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDeletePrice()
          },
          {
            text: labels.purchase,
            cssClass: currentStorePack?.storeId !== 's' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handlePurchase()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default PackDetails
