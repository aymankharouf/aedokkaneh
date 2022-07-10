import { useState, useMemo } from 'react'
import { addPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, Product, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddOffer = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [subPackId, setSubPackId] = useState('')
  const [subCount, setSubCount] = useState('')
  const [withGift, setWithGift] = useState(false)
  const [gift, setGift] = useState('')
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const packs = useMemo(() => statePacks.filter(p => p.product.id === params.id && !p.subPackId)
  .map(p => {
    return {
      id: p.id,
      name: p.name
    }
  }), [statePacks, params.id])
  const name = useMemo(() => {
    let suggestedName = ''
    if (subPackId && subCount) {
      suggestedName = `${+subCount > 1 ? subCount + '×' : ''}${statePacks.find(p => p.id === subPackId)!.name}`
    }
    if (withGift) {
      suggestedName += ' + ' + gift 
    }
    return suggestedName
  }, [subPackId, subCount, withGift, gift, statePacks])
  const handleSubmit = () => {
    try{
      const subPack = statePacks.find(p => p.id === subPackId)!
      if (statePacks.find(p => p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      if (!withGift && Number(subCount) <= 1) {
        throw new Error('invalidQuantity')
      }
      const pack = {
        name,
        product,
        subPackId,
        subCount: +subCount,
        gift,
        unitsCount: +subCount * subPack.unitsCount,
        quantityType: subPack.quantityType,
        price: 0,
        isArchived: false,
      }
      addPack(pack)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addOffer} ${product.name}`} />
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
              interface="action-sheet"
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
            <IonLabel color="primary">{labels.withGift}</IonLabel>
            <IonToggle checked={withGift} onIonChange={() => setWithGift(s => !s)}/>
          </IonItem>
          {withGift &&
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
          }
        </IonList>
      </IonContent>
      {name && subPackId && subCount && (!withGift || gift) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddOffer
