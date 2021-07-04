import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { storeTypes, patterns } from '../data/config'
import { editStore, getMessage } from '../data/actions'
import { IonToggle, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditStore = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [type, setType] = useState(store.type)
  const [name, setName] = useState(store.name)
  const [mobile, setMobile] = useState(store.mobile)
  const [mobileInvalid, setMobileInvalid] = useState(false)
  const [address, setAddress] = useState(store.address)
  const [discount, setDiscount] = useState((store.discount * 100).toString())
  const [mapPosition, setMapPosition] = useState(store.mapPosition)
  const [allowReturn, setAllowReturn] = useState(store.allowReturn)
  const [isActive, setIsActive] = useState(store.isActive)
  const [openTime, setOpenTime] = useState(store.openTime)
  const [hasChanged, setHasChanged] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  useEffect(() => {
    if (name !== store.name
    || type !== store.type
    || mobile !== store.mobile
    || +discount !== store.discount * 100
    || address !== store.address
    || mapPosition !== store.mapPosition
    || allowReturn !== store.allowReturn
    || isActive !== store.isActive
    || openTime !== store.openTime) setHasChanged(true)
    else setHasChanged(false)
  }, [store, name, type, mobile, discount, address, mapPosition, allowReturn, isActive, openTime])
  const handleSubmit = () => {
    try{
      if (discount && +discount <= 0) {
        throw new Error('invalidValue')
      }
      const newStore = {
        ...store,
        name,
        type,
        discount: +discount / 100,
        allowReturn,
        isActive,
        mobile,
        address,
        mapPosition,
        openTime
      }
      editStore(newStore)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
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
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={type}
              onIonChange={e => setType(e.detail.value)}
            >
              {storeTypes.map(t => t.id === '1' ? '' : <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.discount}
            </IonLabel>
            <IonInput 
              value={discount} 
              type="text" 
              clearInput
              onIonChange={e => setDiscount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.allowReturn}</IonLabel>
            <IonToggle checked={allowReturn} onIonChange={() => setAllowReturn(s => !s)}/>
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
      {name && type && !mobileInvalid && hasChanged &&
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
