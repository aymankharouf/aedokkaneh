import { useMemo, useState } from 'react'
import { approveCustomer, blockCustomer, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast, useIonLoading, useIonAlert, IonActionSheet } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { chevronUpOutline } from 'ionicons/icons'
import { Customer, Err, Region, State, Store } from '../data/types'
import { useSelector } from 'react-redux'
import { colors, setup } from '../data/config'

type Params = {
  id: string
}
const CustomerApprove = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const customer = useMemo(() => stateCustomers.find(c => c.id === params.id)!, [stateCustomers, params.id])
  const [name, setName] = useState(customer.name)
  const storeId = useMemo(() => stateStores.find(s => s.mobile === customer.mobile)?.id || '', [stateStores, customer])
  const [mobile, setMobile] = useState(customer.mobile)
  const [regionId, setRegionId] = useState(customer.regionId)
  const [address, setAddress] = useState('')
  const [actionOpened, setActionOpened] = useState(false)
  const regions = useMemo(() => stateRegions.sort((l1, l2) => l1.ordering - l2.ordering), [stateRegions])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [loading, dismiss] = useIonLoading()
  const [alert] = useIonAlert()
  const stores = useMemo(() => stateStores.filter(s => s.id !== 's').sort((s1, s2) => s1.name > s2.name ? 1 : -1), [stateStores]) 
  const handleSubmit = () => {
    try {
      const deliveryFees = regions.find(r => r.id === regionId)?.fees || 0
      if (deliveryFees === 0) {
        throw new Error('invalidDeliveryFees')
      }
      const newCustomer = {
        ...customer,
        name: `${name}:${mobile}`,
        status: 'a',
        regionId,
        storeId,
        orderLimit: setup.orderLimit,
        address,
        deliveryFees,
        mapPosition: '',
        ordersCount: 0,
        deliveredOrdersCount: 0,
      }
      approveCustomer(newCustomer)
      message(labels.approveSuccess)
      history.goBack()  
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleBlock = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: async () => {
          try{
            loading()
            await blockCustomer(customer)
            dismiss()
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(error) {
            dismiss()
            const err = error as Err
			      message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={labels.approveUser} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={mobile} 
              clearInput
              onIonChange={e => setMobile(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.store}
            </IonLabel>
            <IonSelect 
              interface="action-sheet"
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={storeId}
              disabled
            >
              {stores.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonSelect 
              interface="action-sheet"
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={regionId}
              onIonChange={e => setRegionId(e.detail.value)}
            >
              {regions.map(r => <IonSelectOption key={r.id} value={r.id}>{r.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={address} 
              type="text" 
              clearInput
              onIonChange={e => setAddress(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="center" vertical="bottom" slot="fixed">
        <IonFabButton size="small" onClick={() => setActionOpened(true)}>
          <IonIcon ios={chevronUpOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.approve,
            cssClass: name && regionId && mobile ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleSubmit()
          },
          {
            text: labels.block,
            cssClass: colors[i++ % 10].name,
            handler: () => handleBlock()
          },
        ]}
      />

      <Footer />
    </IonPage>
  )
}
export default CustomerApprove
