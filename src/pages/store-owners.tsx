import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { CustomerInfo, State, Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const StoreOwners = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const [store] = useState(() => stateStores.find(s => s.id === params.id)!)
  const [storeOwners, setStoreOwners] = useState<CustomerInfo[]>([])
  useEffect(() => {
    setStoreOwners(() => stateCustomers.filter(c => c.storeId === params.id))
  }, [stateCustomers, params.id])
  return (
    <IonPage>
      <Header title={`${labels.storeOwners} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {storeOwners.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : storeOwners.map(o => 
              <IonItem key={o.id}>
                <IonLabel>{o.name}</IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StoreOwners
