import { useState, useMemo } from 'react'
import { editPrice, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, PackPrice, State, Store } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  packId: string,
  storeId: string
}
const EditPrice = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const pack = useMemo(() => statePacks.find(p => p.id === params.packId)!, [statePacks, params.packId])
  const store = useMemo(() => stateStores.find(s => s.id === params.storeId)!, [stateStores, params.storeId])
  const storePack = useMemo(() => statePackPrices.find(p => p.packId === params.packId && p.storeId === params.storeId)!, [statePackPrices, params.packId, params.storeId])
  const [offerDays, setOfferDays] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [price, setPrice] = useState('')
  const handleSubmit = () => {
    try{
      if (Number(price) !== Number(Number(price).toFixed(2))) {
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
        price : +price * 100,
        offerEnd,
        time: new Date()
      }
      editPrice(newStorePack, storePack.price, statePackPrices, statePacks)
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
              {labels.oldPrice}
            </IonLabel>
            <IonInput 
              value={(storePack.price / 100).toFixed(2)} 
              readonly
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
        </IonList>
      </IonContent>
      {price &&
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
