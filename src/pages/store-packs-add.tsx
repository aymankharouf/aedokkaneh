import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { addPackPrice, getMessage } from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, PackPrice, State, Store } from '../data/types'
import { useSelector } from 'react-redux'
import SmartSelect from './smart-select'

type Params = {
  id: string
}
const AddStorePack = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const [packId, setPackId] = useState('')
  const [price, setPrice] = useState('')
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const packs = useMemo(() => statePacks.map(p => {
                                return {
                                  id: p.id,
                                  name: `${p.product.name}-${p.product.alias} ${p.name}`
                                }
                              })
                              .sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [statePacks]) 
  const handleSubmit = () => {
    try{
      if (statePackPrices.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const storePack = {
        packId,
        storeId: store.id!,
        price: +price * 100,
        isActive: store.isActive,
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
      <Header title={`${labels.addProduct} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <SmartSelect label={labels.product} data={packs} value={packId} onChange={(v) => setPackId(v)} />
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
      {packId && price &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddStorePack
