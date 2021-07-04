import { useState, useEffect } from 'react'
import { addStore, getMessage } from '../data/actions'
import labels from '../data/labels'
import { storeTypes, patterns } from '../data/config'
import { IonToggle, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonTextarea, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'

const AddStore = () => {
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileInvalid, setMobileInvalid] = useState(true)
  const [address, setAddress] = useState('')
  const [discount, setDiscount] = useState('')
  const [mapPosition, setMapPosition] = useState('')
  const [allowReturn, setAllowReturn] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [openTime, setOpenTime] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  const handleSubmit = () => {
    try{
      if (Number(discount) <= 0) {
        throw new Error('invalidValue')
      }
      const store = {
        name,
        type,
        discount : +discount / 100,
        mobile,
        mapPosition,
        allowReturn,
        isActive,
        openTime,
        address,
        balances: [],
        time: new Date()
      }
      addStore(store)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.newStore} />
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
      {name && discount && type && !mobileInvalid &&
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
export default AddStore
