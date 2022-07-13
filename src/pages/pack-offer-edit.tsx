import { useState, useMemo } from 'react'
import { editPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const PackOfferEdit = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [pack] = useState(() => statePacks.find(p => p.id === params.id)!)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subCount, setSubCount] = useState((pack.subCount || 0).toString())
  const [gift, setGift] = useState(pack.gift)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const packs = useMemo(() => statePacks.filter(p => p.product.id === pack.product.id && !p.subPackId)
  .map(p => {
    return {
      id: p.id,
      name: p.name
    }
  }), [statePacks, pack])
  const name = useMemo(() => {
    let suggestedName = ''
    if (subPackId && subCount) {
      suggestedName = `${+subCount > 1 ? subCount + '×' : ''}${statePacks.find(p => p.id === subPackId)!.name}`
    }
    if (gift) {
      suggestedName += ' + ' + gift 
    }
    return suggestedName
  }, [subPackId, subCount, gift, statePacks])
  const hasChanged = useMemo(() => (name !== pack.name)
    || (subPackId !== pack.subPackId)
    || (+subCount !== pack.subCount)
    || (gift !== pack.gift)
  , [pack, name, subPackId, subCount, gift])
  const handleSubmit = () => {
    try{
      const subPack = statePacks.find(p => p.id === subPackId)!
      if (statePacks.find(p => p.id !== pack.id && p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (!gift && +subCount <= 1) {
        throw new Error('invalidQuantity')
      }
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: +subCount,
        unitsCount: +subCount * subPack.unitsCount,
        subPackName: subPack.name,
        quantityType: subPack.quantityType,
        gift
      }
      editPack(newPack, statePacks)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.editOffer} ${pack.product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.pack}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={subPackId}
              onIonChange={e => setSubPackId(e.detail.value)}
            >
              {packs.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.quantity}
            </IonLabel>
            <IonInput 
              value={subCount} 
              type="number" 
              clearInput
              onIonChange={e => setSubCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.gift}
            </IonLabel>
            <IonInput 
              value={gift} 
              type="text" 
              clearInput
              onIonChange={e => setGift(e.detail.value!)} 
              />
          </IonItem>
        </IonList>
      </IonContent>
      {name && subPackId && subCount && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default PackOfferEdit
