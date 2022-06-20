import { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, stockOperationTypes } from '../data/config'
import { getArchivedStockOperations, getMessage } from '../data/actions'
import { Err, MonthlyOperation, State, StockOperation, Store } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { repeatOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type ExtendedStockOperation = StockOperation & {
  storeInfo: Store
}
const ArchivedStockOperations = () => {
  const dispatch = useDispatch()
  const stateMonthlyOperations = useSelector<State, MonthlyOperation[]>(state => state.monthlyOperations)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [stockOperations, setStockOperations] = useState<ExtendedStockOperation[]>([])
  const [monthlyOperations] = useState(() => [...stateMonthlyOperations.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  const [message] = useIonToast()
  const location = useLocation()
  useEffect(() => {
    setStockOperations(() => {
      const stockOperations = stateStockOperations.map(t => {
        const storeInfo = stateStores.find(s => s.id === t.storeId)!
        return {
          ...t,
          storeInfo
        }
      })
      return stockOperations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [stateStockOperations, stateStores])
  const handleRetreive = () => {
    try{
      const id = monthlyOperations[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const operations = getArchivedStockOperations(id)
      if (operations.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_STOCK_OPERATIONS', payload: operations})
      }
      lastMonth.current++
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return(
    <IonPage>
      <Header title={labels.archivedStockOperations} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stockOperations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
        : stockOperations.map(t => 
            <IonItem key={t.id} routerLink={`/stock-operation-details/${t.id}/a`}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{`${stockOperationTypes.find(tt => tt.id === t.type)?.name} ${t.storeId ? t.storeInfo.name : ''}`}</IonText>
                <IonText style={{color: colors[1].name}}>{moment(t.time).fromNow()}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{(t.total / 100).toFixed(2)}</IonLabel>
            </IonItem>   
          )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleRetreive} color="success">
          <IonIcon ios={repeatOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default ArchivedStockOperations
