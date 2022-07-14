import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { IonToggle, IonList, IonItem, IonContent, IonFab, IonFabButton, IonLabel, IonIcon, IonInput, IonPage, IonActionSheet } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useParams } from 'react-router'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Customer, Region, State } from '../data/types'
import { colors } from '../data/config'

type Params = {
  id: string
}
const CustomerInfo = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const [actionOpened, setActionOpened] = useState(false)
  const history = useHistory()
  const customer = useMemo(() => stateCustomers.find(c => c.id === params.id)!, [stateCustomers, params.id])
  let i = 0
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
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.approve,
            cssClass: customer.status === 'n' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/customer-approve/${customer.id}`)
          },
          {
            text: labels.edit,
            cssClass: customer.status === 'a' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/customer-edit/${params.id}`)
          },
          {
            text: labels.orders,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/order-list/${params.id}/u`)
          },

        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default CustomerInfo
