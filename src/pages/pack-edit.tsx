import { useState, useMemo } from 'react'
import { editPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, State } from '../data/types'
import { useSelector } from 'react-redux'
import { quantityTypes } from '../data/config'

type Params = {
  id: string
}
const PackEdit = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount.toString())
  const [quantityType, setQuantityType] = useState(pack.quantityType)
  const [isOffer, setIsOffer] = useState(pack.isOffer)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const hasChanged = useMemo(() => (name !== pack.name)
    || (+unitsCount !== pack.unitsCount)
    || (quantityType !== pack.quantityType)
    || (isOffer !== pack.isOffer)
  , [pack, name, unitsCount, quantityType, isOffer])
  const handleSubmit = () => {
    try{
      if (statePacks.find(p => p.id !== pack.id && p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const newPack = {
        ...pack,
        name,
        unitsCount: +unitsCount,
        quantityType,
        isOffer
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
      <Header title={`${labels.editPack} ${pack.product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.unitsCount}
            </IonLabel>
            <IonInput 
              value={unitsCount} 
              type="number" 
              clearInput
              onIonChange={e => setUnitsCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.quantityType}
            </IonLabel>
            <IonSelect 
              interface="action-sheet"
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={quantityType}
              onIonChange={e => setQuantityType(e.detail.value)}
            >
              {quantityTypes.map(t => <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isOffer}</IonLabel>
            <IonToggle checked={isOffer} onIonChange={() => setIsOffer(s => !s)}/>
          </IonItem>

        </IonList>
      </IonContent>
      {name && unitsCount && quantityType && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default PackEdit
