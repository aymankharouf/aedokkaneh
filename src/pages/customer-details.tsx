import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { IonToggle, IonList, IonItem, IonContent, IonFab, IonFabButton, IonFabList, IonLabel, IonIcon, IonInput, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { chevronDownOutline, pencilOutline, swapVerticalOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const CustomerDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [customer, setCustomer] = useState(() => state.customers.find(c => c.id === params.id)!)
  const [userInfo, setUserInfo] = useState(() => state.users.find(u => u.id === params.id)!)
  const [storeName] = useState(() => state.stores.find(s => s.id === customer.storeId)?.name || '')
  useEffect(() => {
    setCustomer(() => state.customers.find(c => c.id === params.id)!)
    setUserInfo(() => state.users.find(u => u.id === params.id)!)
  }, [state.customers, state.users, params.id])
  return (
    <IonPage>
      <Header title={labels.customerDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={userInfo.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.fullName}
            </IonLabel>
            <IonInput 
              value={customer.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonInput 
              value={state.regions.find(r => r.id === userInfo.regionId)?.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.orderLimit}
            </IonLabel>
            <IonInput 
              value={(customer.orderLimit / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.totalOrders}
            </IonLabel>
            <IonInput 
              value={customer.ordersCount} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.deliveredOrdersCount}
            </IonLabel>
            <IonInput 
              value={customer.deliveredOrdersCount} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.deliveredOrdersTotal}
            </IonLabel>
            <IonInput 
              value={(customer.deliveredOrdersTotal / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.returnedCount}
            </IonLabel>
            <IonInput 
              value={customer.returnedCount} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.discountBalance}
            </IonLabel>
            <IonInput 
              value={(customer.discounts / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.deliveryFees}
            </IonLabel>
            <IonInput 
              value={(customer.deliveryFees / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.specialDiscount}
            </IonLabel>
            <IonInput 
              value={(customer.specialDiscount / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.store}
            </IonLabel>
            <IonInput 
              value={storeName} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mapPosition}
            </IonLabel>
            <IonInput 
              value={customer.mapPosition} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={customer.address} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isBlocked}</IonLabel>
            <IonToggle checked={customer.isBlocked} disabled/>
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/edit-customer/${params.id}`}>
            <IonIcon ios={pencilOutline} />
          </IonFabButton>
          <IonFabButton color="danger" routerLink={`/orders-list/${params.id}/u`}>
            <IonIcon ios={swapVerticalOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default CustomerDetails
