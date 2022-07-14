import { useState, useMemo } from 'react'
import { addStore, getMessage } from '../data/actions'
import labels from '../data/labels'
import { patterns } from '../data/config'
import { IonToggle, IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, State, Store } from '../data/types'
import { useSelector } from 'react-redux'

const StoreAdd = () => {
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const mobileInvalid = useMemo(() => mobile && !patterns.mobile.test(mobile), [mobile])
  const [address, setAddress] = useState('')
  const [mapPosition, setMapPosition] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [openTime, setOpenTime] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()

  const handleSubmit = () => {
    try{
      if (mobile && stateStores.find(s => s.mobile === mobile)) {
        throw new Error('mobileFound')
      }
      const store = {
        name,
        mobile,
        mapPosition,
        isActive,
        openTime,
        address,
      }
      addStore(store)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.newStore} />
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
      {name && !mobileInvalid &&
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
export default StoreAdd
