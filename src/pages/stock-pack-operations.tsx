import { useState, useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, quantityText, unfoldStockPack } from '../data/actions'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { Err, Pack, PackPrice, Purchase, ReturnBasket, State, Stock, StockOperation, Store } from '../data/types'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { constructOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  id: string
}
const StockPackOperations = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const stateReturnBasket = useSelector<State, ReturnBasket | undefined>(state => state.returnBasket)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const stockPack = useMemo(() => stateStocks.find(s => s.id === params.id)!, [stateStocks, params.id])
  const [actionOpened, setActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const lastPurchase = useMemo(() => {
    const purchases = statePurchases.filter(p => p.basket.find(bp => bp.packId === pack.id))
    const result = purchases.map(p => {
      const operationPack = p.basket.find(bp => bp.packId === pack.id)!
      const storeInfo = stateStores.find(s => s.id === p.storeId)!
      return {
        ...operationPack,
        storeInfo,
        id: '',
        type: '',
        purchaseId: p.id!,
        time: p.time
      }
    })
    result.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    return result[0]
  }, [statePurchases, stateStores, pack])
  const packOperations = useMemo(() => stateStockOperations.filter(t => t.basket.find(p => p.packId === pack.id))
                                                            .map(t => {
                                                              const operationPack = t.basket.find(p => p.packId === pack.id)!
                                                              const storeInfo = stateStores.find(s => s.id === t.storeId)!
                                                              return {
                                                                ...operationPack,
                                                                id: t.id!,
                                                                purchaseId: t.purchaseId,
                                                                type: t.type,
                                                                time: t.time,
                                                                storeInfo
                                                              }
                                                            })
                                                            .sort((t1, t2) => t2.time > t1.time ? 1 : -1)
  , [stateStockOperations, stateStores, pack])
  const handleQuantity = (type: string, quantity: number) => {
    try{
      if (stateReturnBasket?.packs?.find(p => p.id === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      if (Number(quantity) > stockPack.quantity) {
        throw new Error('invalidValue')
      }
      if (stateReturnBasket && stateReturnBasket.type !== type) {
        throw new Error('diffTypeInReturnBasket')
      }
      if (type === 'r' && stateReturnBasket && stateReturnBasket.purchaseId !== lastPurchase?.purchaseId) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type,
        packId: pack.id,
        price: type === 'r' ? lastPurchase.price : stockPack.price,
        quantity: Number(quantity),
        storeId: type === 'r' ? lastPurchase.storeInfo.id : '',
        purchaseId: type === 'r' ? lastPurchase.purchaseId : '',
        weight: pack.quantityType !== 'c' ? Number(quantity) : 0
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
      message(labels.addToBasketSuccess, 3000)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleAddOperation = (type: string) => {
    alert({
      header: labels.enterQuantity,
      inputs: [{name: 'quantity', type: 'number'}],
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: (e) => handleQuantity(type, e.quantity)}
      ],
    })
  }
  const handleOpen = () => {
    try{
      unfoldStockPack(stockPack, statePackPrices, statePacks, stateStores)
      message(labels.executeSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }      
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${pack.product.name} ${pack.name}`} />
      <IonContent fullscreen>
        <IonList>
          {packOperations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packOperations.map(t => 
              <IonItem key={t.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${stockOperationTypes.find(tt => tt.id === t.type)?.name} ${t.storeInfo?.name || ''}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${labels.price}: ${(t.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      {stockPack.quantity > 0 &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setActionOpened(true)} color="success">
            <IonIcon ios={constructOutline} />
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.open,
            cssClass: pack.subPackId ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleOpen()
          },
          {
            text: labels.return,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('r')
          },
          {
            text: labels.donate,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('g')
          },
          {
            text: labels.destroy,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('d')
          },
          {
            text: labels.sell,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('s')
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default StockPackOperations
