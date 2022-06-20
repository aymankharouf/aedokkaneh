import { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { getArchivedPurchases, getMessage } from '../data/actions'
import { Err, MonthlyOperation, Purchase, State, Store } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { repeatOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector, useDispatch } from 'react-redux'

type ExtendedPurchase = Purchase & {
  storeInfo: Store
}
const ArchivedPurchases = () => {
  const dispatch = useDispatch()
  const stateMonthlyOperations = useSelector<State, MonthlyOperation[]>(state => state.monthlyOperations)
  const stateArchivedPurchases = useSelector<State, Purchase[]>(state => state.archivedPurchases)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [purchases, setPurchases] = useState<ExtendedPurchase[]>([])
  const [monthlyOperations] = useState(() => [...stateMonthlyOperations.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  const [message] = useIonToast()
  const location = useLocation()
  useEffect(() => {
    setPurchases(() => {
      const purchases = stateArchivedPurchases.map(p => {
        const storeInfo = stateStores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time > p1.time ? 1 : -1)
    })
  }, [stateArchivedPurchases, stateStores])
  const handleRetreive = () => {
    try{
      const id = monthlyOperations[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const purchases = getArchivedPurchases(id)
      if (purchases.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_PURCHASES', payload: purchases})
      }
      lastMonth.current++
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return(
    <IonPage>
      <Header title={labels.archivedPurchases} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {purchases.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : purchases.map(p =>
              <IonItem key={p.id} routerLink={`/purchase-details/${p.id}/a`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.storeInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(p.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(p.total / 100).toFixed(2)}</IonLabel>
              </IonItem>   
            )
          }
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

export default ArchivedPurchases
