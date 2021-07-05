import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { addPackPrice, getMessage } from '../data/actions'
import { Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const AddPackStore = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [store, setStore] = useState<Store>()
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (storeId) {
      setStore(state.stores.find(s => s.id === storeId)!)
    }
  }, [state.stores, storeId])
  useEffect(() => {
    setIsActive(store?.isActive || false)
  }, [store])
  useEffect(() => {
    if (cost) {
      setPrice((+cost * (1 + (store?.isActive && store?.type !== '5' ? 0 : store?.discount || 0))).toFixed(2))
    } else {
      setPrice('')
    }
  }, [cost, store])
  const handleSubmit = () => {
    try{
      if (state.packPrices.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(cost) <= 0 || Number(cost) !== Number(Number(cost).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      if (Number(price) < Number(cost)) {
        throw new Error('invalidPrice')
      }
      if (offerDays && Number(offerDays) <= 0) {
        throw new Error('invalidPeriod')
      }
      let offerEnd = null
      if (offerDays) {
        offerEnd = new Date()
        offerEnd.setDate(offerEnd.getDate() + Number(offerDays))
      }
      const storePack = {
        packId: pack.id!,
        storeId,
        cost: +cost * 100,
        price: +price * 100,
        offerEnd,
        isActive,
        time: new Date(),
        quantity: 0,
        weight: 0,
        isAuto: false
      }
      addPackPrice(storePack, state.packPrices, state.packs)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
    	message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={`${labels.addPrice} ${pack.productName} ${pack.name}${pack.closeExpired ? '(' + labels.closeExpired + ')' : ''}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.store}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={storeId}
              onIonChange={e => setStoreId(e.detail.value)}
            >
              {stores.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.cost}
            </IonLabel>
            <IonInput 
              value={cost} 
              type="number" 
              clearInput
              onIonChange={e => setCost(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.offerDays}
            </IonLabel>
            <IonInput 
              value={offerDays} 
              type="number" 
              clearInput
              onIonChange={e => setOfferDays(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={isActive} onIonChange={() => setIsActive(s => !s)}/>
          </IonItem>
        </IonList>
      </IonContent>
      {storeId && cost &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPackStore
