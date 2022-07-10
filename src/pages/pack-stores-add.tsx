import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { addPackPrice, getMessage } from '../data/actions'
import { Err, Pack, PackPrice, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddPackStore = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const [price, setPrice] = useState('')
  const [storeId, setStoreId] = useState('')
  const stores = useMemo(() => stateStores.filter(s => !statePackPrices.find(p => p.storeId === s.id && p.packId === params.id)), [stateStores, statePackPrices])
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (statePackPrices.find(p => p.packId === pack.id && p.storeId === storeId)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const storeStatus = stateStores.find(s => s.id === storeId)?.isActive!
      const storePack = {
        packId: pack.id!,
        storeId,
        price: Math.floor(+price * 100),
        isActive: storeStatus,
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
      <Header title={`${labels.addPrice} ${pack.product.name} ${pack.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
        <IonItem>
            <IonLabel position="floating" color="primary">{labels.store}</IonLabel>
            <IonSelect 
              interface="action-sheet"
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
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {storeId && price &&
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
