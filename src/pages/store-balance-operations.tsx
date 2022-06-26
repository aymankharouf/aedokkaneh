import { useState, useMemo } from 'react'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { paymentTypes } from '../data/config'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useParams } from 'react-router'
import { addOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Purchase, State, StockOperation, Store, StorePayment } from '../data/types'

type Params = {
  id: string,
  storeId: string,
  month: string
}
const StoreBalanceOperations = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateStorePayments = useSelector<State, StorePayment[]>(state => state.storePayments)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const [store] = useState(() => stateStores.find(s => s.id === params.storeId)!)
  const month = (Number(params.month) % 100) - 1
  const year = Math.trunc(Number(params.month) / 100)
  const operations = useMemo(() => {
      const storePayments = stateStorePayments.filter(p => p.storeId === params.storeId && p.paymentDate.getFullYear() === year && p.paymentDate.getMonth() === month)
      const result1 = storePayments.map(p => {
        const paymentTypeInfo = paymentTypes.find(t => t.id === p.type)!
        return {
          amount: p.amount,
          time: p.paymentDate,
          name: paymentTypeInfo.name
        }
      })
      const purchases = statePurchases.filter(p => p.storeId === params.storeId && (p.time).getFullYear() === year && (p.time).getMonth() === month)
      const result2 = purchases.map(p => {
        return {
          amount: p.total,
          time: p.time,
          name: labels.purchase
        }
      })
      const stockOperations = stateStockOperations.filter(t => t.storeId === params.id && t.type === 's' && (t.time).getFullYear() === year && (t.time).getMonth() === month)
      const result3 = stockOperations.map(t => {
        return {
          amount: t.total,
          time: t.time,
          name: labels.sale
        }
      })
      const result = [...result1, ...result2, ...result3]
      return result.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
  }, [statePurchases, stateStockOperations, stateStorePayments, params.id, month, year, params.storeId])
  let i = 0
  return(
    <IonPage>
      <Header title={`${labels.balanceOperations} ${store.name} ${year}-${month}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {operations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : operations.map(t => 
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{t.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(t.amount / 100).toFixed(2)}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink={`/add-store-payment/${params.id}`} color="success">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default StoreBalanceOperations
