import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { CustomerInfo } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'

type Params = {
  id: string
}
const StoreOwners = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [storeOwners, setStoreOwners] = useState<CustomerInfo[]>([])
  useEffect(() => {
    setStoreOwners(() => state.customers.filter(c => c.storeId === params.id))
  }, [state.customers, params.id])
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
