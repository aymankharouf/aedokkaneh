import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { addPackPrice, getMessage } from '../data/actions'
import { Err, Pack, PackPrice, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import SmartSelect from './smart-select'

type Params = {
  id: string
}
const AddPackStore = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [storeId, setStoreId] = useState('')
  const stores = useMemo(() => stateStores.filter(s => s.id !== 's'), [stateStores])
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (statePackPrices.find(p => p.packId === pack.id && p.storeId === storeId)) {
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
      addPackPrice(storePack, statePackPrices, statePacks)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <IonPage>
      <Header title={`${labels.addPrice} ${pack.productName} ${pack.name}${pack.closeExpired ? '(' + labels.closeExpired + ')' : ''}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <SmartSelect label={labels.store} data={stores} onChange={(v) => setStoreId(v)} />
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
