import { useMemo } from 'react'
import labels from '../data/labels'
import { getMessage, quantityText, returnPurchase } from '../data/actions'
import { Err, Pack, Purchase, PurchasePack, State, Stock } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation, useParams } from 'react-router'
import { colors } from '../data/config'
import { refreshOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
type ExtendedPack = PurchasePack & {
  pack: Pack
}
const PurchaseDetails = () => {
  const params = useParams<Params>()
  const stateArchivedPurchases = useSelector<State, Purchase[]>(state => state.archivedPurchases)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const [message] = useIonToast()
  const location = useLocation()
  const [alert] = useIonAlert()
  const purchase = useMemo(() => params.type === 'a' ? stateArchivedPurchases.find(p => p.id === params.id) : statePurchases.find(p => p.id === params.id), [statePurchases, stateArchivedPurchases, params.id, params.type])
  const purchaseBasket = useMemo(() => purchase?.basket.map(p => {
                                                        const pack = statePacks.find(pa => pa.id === p.packId)!
                                                        return {
                                                          ...p,
                                                          pack,
                                                        }
                                                      })
  , [statePacks, purchase])
  const handleReturn = (purchasePack: ExtendedPack, quantity: number, weight: number) => {
    try{
      const stockPack = stateStocks.find(s => s.id === purchasePack.packId)
      if (!stockPack || stockPack.quantity < quantity) {
        throw new Error('noStock')
      }
      if (quantity > purchasePack.quantity || weight > purchasePack.weight) {
        throw new Error('invalidQuantity')
      }
      returnPurchase(stockPack, quantity, weight, purchase!)
      message(labels.executeSuccess, 3000)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleQuantity = (purchasePack: ExtendedPack) => {
    if (purchasePack.pack.quantityType === 'wc') {
      alert({
        header: labels.enterWeight,
        inputs: [
          {name: 'quantity', type: 'number', label: labels.quantity},
          {name: 'weight', type: 'number', label: labels.weight}
        ],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e: any) => handleReturn(purchasePack, Number(e.quantity), Number(e.weight))}
        ],
      })
    } else {
      alert({
        header: labels.enterQuantity,
        inputs: [{name: 'quantity', type: 'number'}],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e: any) => handleReturn(purchasePack, Number(e.quantity), 0)}
        ],
      })
    }
  }

  let i = 0
  return(
    <IonPage>
      <Header title={labels.purchaseDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {purchaseBasket?.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : purchaseBasket?.map(p => 
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.price}: ${(Math.round(p.price * (p.weight || p.quantity)) / 100).toFixed(2)}`}</IonText>
                </IonLabel>
                {params.type === 'n' &&
                  <IonIcon 
                    ios={refreshOutline} 
                    slot="end" 
                    color="danger"
                    style={{fontSize: '20px', marginRight: '10px'}} 
                    onClick={()=> handleQuantity(p)}
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
