import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { addStock, getMessage } from '../data/actions'
import labels from '../data/labels'
import { Store } from '../data/types'
import { IonBadge, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'

type ExtendedStore = Store & {
  sales: number
}
const Stores = () => {
  const { state } = useContext(StateContext)
  const [stores, setStores] = useState<ExtendedStore[]>([])
  const [stock, setStock] = useState<Store>()
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  useEffect(() => {
    setStock(() => state.stores.find(s => s.id === 's'))
  }, [state.stores])
  useEffect(() => {
    setStores(() => {
      const today = new Date()
      today.setDate(today.getDate() - 30)
      const stores = state.stores.filter(s => s.id !== 's')
      const result = stores.map(s => {
        const storePurchases = state.purchases.filter(p => p.storeId === s.id && p.time >= today)
        const sales = storePurchases.reduce((sum, p) => sum + p.total, 0)
        return {
          ...s,
          sales
        }
      })
      return result.sort((s1, s2) => s1.sales - s2.sales)
    })
  }, [state.stores, state.purchases])
  const handleAddStock = () => {
    try{
      addStock()
      message(labels.addSuccess, 3000)
      history.goBack()  
    } catch(err) {
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
                <IonLabel slot="end" className="price">{s.discount * 100}</IonLabel>
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
