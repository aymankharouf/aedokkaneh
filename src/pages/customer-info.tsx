import { useMemo } from 'react'
import labels from '../data/labels'
import { IonToggle, IonList, IonItem, IonContent, IonFab, IonFabButton, IonFabList, IonLabel, IonIcon, IonInput, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { checkmarkOutline, chevronDownOutline, pencilOutline, swapVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Customer, Region, State } from '../data/types'

type Params = {
  id: string
}
const CustomerInfo = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const customer = useMemo(() => stateCustomers.find(c => c.id === params.id)!, [stateCustomers, params.id])
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
              value={customer.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonInput 
              value={stateRegions.find(r => r.id === customer.regionId)?.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.orderLimit}
            </IonLabel>
            <IonInput 
              value={customer.orderLimit ? (customer.orderLimit / 100).toFixed(2) : ''} 
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
              {labels.deliveryFees}
            </IonLabel>
            <IonInput 
              value={customer.deliveryFees ? (customer.deliveryFees / 100).toFixed(2) : ''} 
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
            <IonToggle checked={customer.status === 'b'} disabled/>
          </IonItem>
        </IonList>
      </IonContent>
      {customer.status === 'n' ?
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/customer-approve/${customer.id}`}>
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      :    
        <IonFab horizontal="end" vertical="top" slot="fixed">
          <IonFabButton>
            <IonIcon ios={chevronDownOutline} />
          </IonFabButton>
          <IonFabList>
            <IonFabButton color="success" routerLink={`/customer-edit/${params.id}`}>
              <IonIcon ios={pencilOutline} />
            </IonFabButton>
            <IonFabButton color="danger" routerLink={`/order-list/${params.id}/u`}>
              <IonIcon ios={swapVerticalOutline} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}
export default CustomerInfo
