import { useMemo } from 'react'
import { addStock, getMessage } from '../data/actions'
import labels from '../data/labels'
import { Err, Purchase, State, Store } from '../data/types'
import { IonBadge, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'

const Stores = () => {
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const stock = useMemo(() => stateStores.find(s => s.id === 's'), [stateStores])
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
  const handleAddStock = () => {
    try{
      addStock()
      message(labels.addSuccess, 3000)
      history.goBack()  
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
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
              <IonItem routerLink={`/store-details/${s.id}`} key={s.id}>
                <IonLabel>{s.name}</IonLabel>
                {!s.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-store" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      {!stock &&
        <div className="ion-padding" style={{textAlign: 'center'}}>
          <IonButton
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            onClick={handleAddStock}
          >
            {labels.stockName}
          </IonButton>
        </div>
      }
      <Footer />
    </IonPage>
  )
}

export default Stores
