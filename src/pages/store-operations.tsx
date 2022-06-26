import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, stockOperationTypes } from '../data/config'
import { Purchase, State, StockOperation, Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const StoreOperations = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const operations = useMemo(() => {
    const stockOperations = stateStockOperations.filter(t => t.storeId === params.id && t.type !== 'p')
    const purchases = statePurchases.filter(p => p.storeId === params.id)
    const result = purchases.map(p => {
      return {
        purchaseId: p.id!,
        storeId: p.storeId,
        type: 'p',
        total: p.total,
        time: p.time,
        basket: p.basket
      }
    })
    const operations = [...result, ...stockOperations]
    return operations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
  }, [stateStockOperations, statePurchases, params.id])

  return(
    <IonPage>
      <Header title={`${labels.operations} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {operations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>  
          : operations.map(t => 
              <IonItem key={t.purchaseId} routerLink={t.type === 'p' ? `/purchase-details/${t.purchaseId}/n` : `/stock-operation-details/${t.purchaseId}/n`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{stockOperationTypes.find(tt => tt.id === t.type)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.total}: ${(t.total / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StoreOperations
