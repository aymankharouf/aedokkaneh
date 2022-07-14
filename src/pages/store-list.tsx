import { useMemo } from 'react'
import labels from '../data/labels'
import { Purchase, State, Store } from '../data/types'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'

const StoreList = () => {
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stores = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() - 30)
    const stores = stateStores.filter(s => s.id !== 's')
    return stores.map(s => {
      const storePurchases = statePurchases.filter(p => p.storeId === s.id && p.time >= today)
      const sales = storePurchases.reduce((sum, p) => sum + p.total, 0)
      return {
        ...s,
        sales
      }
    })
    .sort((s1, s2) => s1.sales - s2.sales)
  }, [stateStores, statePurchases])
  return (
    <IonPage>
      <Header title={labels.stores} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stores.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : stores.map(s =>
              <IonItem routerLink={`/store-info/${s.id}`} key={s.id}>
                <IonLabel>{s.name}</IonLabel>
                {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/store-add">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default StoreList
