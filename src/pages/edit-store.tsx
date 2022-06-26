import { useState, useMemo } from 'react'
import labels from '../data/labels'
import { patterns } from '../data/config'
import { editStore, getMessage } from '../data/actions'
import { IonToggle, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, State, Store } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const EditStore = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [store] = useState(() => stateStores.find(s => s.id === params.id)!)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const mobileInvalid = useMemo(() => !mobile || !patterns.mobile.test(mobile), [mobile])
  const [address, setAddress] = useState(store.address)
  const [mapPosition, setMapPosition] = useState(store.mapPosition)
  const [isActive, setIsActive] = useState(store.isActive)
  const [openTime, setOpenTime] = useState(store.openTime)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const hasChanged = useMemo(() => (name !== store.name)
    || (mobile !== store.mobile)
    || (address !== store.address)
    || (mapPosition !== store.mapPosition)
    || (isActive !== store.isActive)
    || (openTime !== store.openTime)
  , [store, name, mobile, address, mapPosition, isActive, openTime])
  const handleSubmit = () => {
    try{
      const newStore = {
        ...store,
        name,
        isActive,
        mobile,
        address,
        mapPosition,
        openTime
      }
      editStore(newStore)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editStore} />
      <IonContent fullscreen>
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
            <IonLabel position="floating" color={mobileInvalid ? 'danger' : 'primary'}>
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={mobile} 
              type="number" 
              clearInput
              onIonChange={e => setMobile(e.detail.value!)} 
              color={mobileInvalid ? 'danger' : ''}
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={isActive} onIonChange={() => setIsActive(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.openTime}
            </IonLabel>
            <IonInput 
              value={openTime} 
              type="text" 
              clearInput
              onIonChange={e => setOpenTime(e.detail.value!)} 
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
        </IonList>
      </IonContent>
      {name && !mobileInvalid && hasChanged &&
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
export default EditStore
