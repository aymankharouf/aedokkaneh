import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { StockOperation, Store } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { cloudUploadOutline } from 'ionicons/icons'

type ExtendedStockOperation = StockOperation & {
  storeInfo: Store
}
const StockOperations = () => {
  const { state } = useContext(StateContext)
  const [stockOperations, setStockOperations] = useState<ExtendedStockOperation[]>([])
  useEffect(() => {
    setStockOperations(() => {
      const stockOperations = state.stockOperations.map(t => {
        const storeInfo = state.stores.find(s => s.id === t.storeId)!
        return {
          ...t,
          storeInfo
        }
      })
      return stockOperations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockOperations, state.stores])
  return(
    <IonPage>
      <Header title={labels.stockOperations} />
      <IonContent fullscreen>
        <IonList>
          {stockOperations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : stockOperations.map(t => 
              <IonItem key={t.id} routerLink={`/stock-operation-details/${t.id}/n`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${stockOperationTypes.find(tt => tt.id === t.type)?.name} ${t.storeId ? t.storeInfo.name : ''}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(t.total / 100).toFixed(2)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/archived-stock-operations" color="success">
          <IonIcon ios={cloudUploadOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default StockOperations
