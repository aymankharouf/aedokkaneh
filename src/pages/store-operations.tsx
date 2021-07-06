import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors, stockOperationTypes } from '../data/config'
import { StockOperation } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'

type Params = {
  id: string
}
const StoreOperations = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [operations, seOperations] = useState<StockOperation[]>([])
  useEffect(() => {
    seOperations(() => {
      const stockOperations = state.stockOperations.filter(t => t.storeId === params.id && t.type !== 'p')
      const purchases = state.purchases.filter(p => p.storeId === params.id)
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
    })
  }, [state.stockOperations, state.purchases, params.id])

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
              <IonItem key={t.id} routerLink={t.type === 'p' ? `/purchase-details/${t.id}/n` : `/stock-operation-details/${t.id}/n`}>
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
