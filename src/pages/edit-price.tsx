import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { editPrice, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err } from '../data/types'

type Params = {
  packId: string,
  storeId: string
}
const EditPrice = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [pack] = useState(() => state.packs.find(p => p.id === params.packId)!)
  const [store] = useState(() => state.stores.find(s => s.id === params.storeId)!)
  const [storePack] = useState(() => state.packPrices.find(p => p.packId === params.packId && p.storeId === params.storeId)!)
  const [cost, setCost] = useState(params.storeId === 's' ? (storePack.cost / 100).toFixed(2) : '')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (cost && store.id !== 's') {
      setPrice((+cost * (1 + (store.isActive && store.type !== '5' ? 0 : store.discount))).toFixed(2))
    } else {
      setPrice('')
    }
  }, [cost, store])
  const handleSubmit = () => {
    try{
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
      const newStorePack = {
        ...storePack,
        cost: +cost * 100,
        price : +price * 100,
        offerEnd,
        time: new Date()
      }
      editPrice(newStorePack, storePack.price, state.packPrices, state.packs)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.editPrice} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.product}
            </IonLabel>
            <IonInput 
              value={pack.productName} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.pack}
            </IonLabel>
            <IonInput 
              value={pack.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.oldCost}
            </IonLabel>
            <IonInput 
              value={(storePack.cost / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.oldPrice}
            </IonLabel>
            <IonInput 
              value={(storePack.price / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          {params.storeId === 's' && 
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
          }
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
        </IonList>
      </IonContent>
      {cost && (!storePack.isActive || price) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
    }
    </IonPage>
  )
}
export default EditPrice
