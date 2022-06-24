import { useState, useEffect, useMemo } from 'react'
import { editCustomer, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonToggle, IonContent, IonSelect, IonSelectOption, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { CustomerInfo, Err, Region, State, Store, UserInfo } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const EditCustomer = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [customer] = useState(() => stateCustomers.find(c => c.id === params.id)!)
  const [userInfo] = useState(() => stateUsers.find(u => u.id === params.id)!)
  const [name, setName] = useState(userInfo.name)
  const [address, setAddress] = useState(customer.address)
  const [regionId, setRegionId] = useState(userInfo.regionId)
  const [mapPosition, setMapPosition] = useState(customer.mapPosition)
  const [isBlocked, setIsBlocked] = useState(customer.isBlocked)
  const [deliveryFees, setDeliveryFees] = useState((customer.deliveryFees / 100).toFixed(2))
  const [orderLimit, setOrderLimit] = useState((customer.orderLimit / 100).toFixed(2))
  const [hasChanged, setHasChanged] = useState(false)
  const regions= useMemo(() => stateRegions.sort((l1, l2) => l1.name > l2.name ? 1 : -1), [stateRegions])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (name !== userInfo.name
    || address !== customer.address
    || regionId !== userInfo.regionId
    || mapPosition !== customer.mapPosition
    || isBlocked !== customer.isBlocked
    || +deliveryFees * 100 !== customer.deliveryFees
    || +orderLimit * 100 !== customer.orderLimit) setHasChanged(true)
    else setHasChanged(false)
  }, [customer, userInfo, name, address, regionId, mapPosition, isBlocked, deliveryFees, orderLimit])
  const handleSubmit = () => {
    try{
      if (Number(deliveryFees) < 0 || Number(deliveryFees) !== Number(Number(deliveryFees).toFixed(2))) {
        throw new Error('invalidValue')
      }
      if (Number(orderLimit) < 0 || Number(orderLimit) !== Number(Number(orderLimit).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const newCustomer = {
        ...customer,
        address,
        mapPosition,
        isBlocked,
        deliveryFees: +deliveryFees * 100,
        orderLimit: +orderLimit * 100,
      }
      editCustomer(newCustomer, name, regionId, userInfo.mobile, customer.storeId, stateStores)
      message(labels.editSuccess, 3000)
      history.goBack()    
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editCustomer} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonSelect 
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
              {labels.deliveryFees}
            </IonLabel>
            <IonInput 
              value={deliveryFees} 
              type="number" 
              clearInput
              onIonChange={e => setDeliveryFees(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.orderLimit}
            </IonLabel>
            <IonInput 
              value={orderLimit} 
              type="number" 
              clearInput
              onIonChange={e => setOrderLimit(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mapPosition}
            </IonLabel>
            <IonInput 
              value={mapPosition} 
              type="text" 
              clearInput
              onIonChange={e => setMapPosition(e.detail.value!)} 
            />
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
          <IonItem>
            <IonLabel color="primary">{labels.isBlocked}</IonLabel>
            <IonToggle checked={isBlocked} onIonChange={() => setIsBlocked(s => !s)}/>
          </IonItem>
        </IonList>
      </IonContent>
      {name && regionId && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}
export default EditCustomer
