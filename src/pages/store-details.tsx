import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { storeTypes } from '../data/config'
import { IonToggle, IonList, IonItem, IonContent, IonFab, IonFabButton, IonFabList, IonLabel, IonIcon, IonInput, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { cartOutline, chevronDownOutline, pencilOutline, personOutline, swapVerticalOutline, walletOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const StoreDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store, setStore] = useState(() => state.stores.find(s => s.id === params.id)!)
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === params.id)!)
  }, [state.stores, params.id])

  return (
    <IonPage>
      <Header title={labels.storeDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={store.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.balance}
            </IonLabel>
            <IonInput 
              value={((store.balances?.reduce((sum, b) => sum + b.balance, 0) || 0) / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={store.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonInput 
              value={storeTypes.find(t => t.id === store.type)?.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.discount}
            </IonLabel>
            <IonInput 
              value={store.discount * 100} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.allowReturn}</IonLabel>
            <IonToggle checked={store.allowReturn} disabled />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={store.isActive} disabled />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.openTime}
            </IonLabel>
            <IonInput 
              value={store.openTime} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={store.address} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/store-packs/${params.id}`}>
            <IonIcon ios={cartOutline} />
          </IonFabButton>
          <IonFabButton color="secodary" routerLink={`/edit-store/${params.id}`}>
            <IonIcon ios={pencilOutline} />
          </IonFabButton>
          <IonFabButton color="warning" routerLink={`/store-operations/${store.id}`}>
            <IonIcon ios={swapVerticalOutline} />
          </IonFabButton>
          <IonFabButton color="tertiary" routerLink={`/store-owners/${store.id}`}>
            <IonIcon ios={personOutline} />
          </IonFabButton>
          <IonFabButton color="danger" routerLink={`/store-balance/${store.id}`}>
            <IonIcon ios={walletOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default StoreDetails
