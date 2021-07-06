import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import { getMessage, quantityText, unfoldStockPack } from '../data/actions'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { StockPack, Store } from '../data/types'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { constructOutline } from 'ionicons/icons'

type Params = {
  id: string
}
type ExtendedStockPack = StockPack & {
  storeInfo: Store,
  id: string,
  purchaseId: string,
  type: string,
  time: Date
}
const StockPackOperations = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [stockPackInfo] = useState(() => state.packPrices.find(p => p.storeId === 's' && p.packId === params.id)!)
  const [actionOpened, setActionOpened] = useState(false)
  const [packOperations, setPackOperations] = useState<ExtendedStockPack[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [lastPurchase] = useState<ExtendedStockPack>(() => {
    const purchases = state.purchases.filter(p => p.basket.find(bp => bp.packId === pack.id))
    const result = purchases.map(p => {
      const operationPack = p.basket.find(bp => bp.packId === pack.id)!
      const storeInfo = state.stores.find(s => s.id === p.storeId)!
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
  })
  useEffect(() => {
    setPackOperations(() => {
      const packOperations = state.stockOperations.filter(t => t.basket.find(p => p.packId === pack.id))
      const result = packOperations.map(t => {
        const operationPack = t.basket.find(p => p.packId === pack.id)!
        const storeInfo = state.stores.find(s => s.id === t.storeId)!
        return {
          ...operationPack,
          id: t.id!,
          purchaseId: t.purchaseId,
          type: t.type,
          time: t.time,
          storeInfo
        }
      })
      return result.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockOperations, state.stores, pack])
  const handleQuantity = (type: string, quantity: number) => {
    try{
      if (state.returnBasket?.packs?.find(p => p.packId === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      if (Number(quantity) > stockPackInfo.quantity) {
        throw new Error('invalidValue')
      }
      if (state.returnBasket && state.returnBasket.type !== type) {
        throw new Error('diffTypeInReturnBasket')
      }
      if (type === 'r' && state.returnBasket && state.returnBasket.purchaseId !== lastPurchase?.purchaseId) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type,
        packId: pack.id,
        cost: type === 'r' ? lastPurchase.cost : stockPackInfo.cost,
        price: type === 'r' ? lastPurchase.price : stockPackInfo.price,
        quantity: Number(quantity),
        storeId: type === 'r' ? lastPurchase.storeInfo.id : '',
        purchaseId: type === 'r' ? lastPurchase.purchaseId : '',
        weight: pack.byWeight ? Number(quantity) : 0
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
      message(labels.addToBasketSuccess, 3000)
    } catch(err) {
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
      unfoldStockPack(stockPackInfo, state.packPrices, state.packs, state.stores)
      message(labels.executeSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }      
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${pack.productName} ${pack.name}`} />
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
                  <IonText style={{color: colors[2].name}}>{`${labels.price}: ${(t.cost / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      {stockPackInfo.quantity > 0 &&
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
            cssClass: lastPurchase?.storeInfo?.allowReturn ? colors[i++ % 10].name : 'ion-hide',
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
