import { useState, useMemo } from 'react'
import { addPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, Product, State } from '../data/types'
import { useSelector } from 'react-redux'
import { quantityTypes } from '../data/config'

type Params = {
  id: string
}
const PackAdd = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [quantityType, setQuantityType] = useState('')
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (statePacks.find(p => p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const pack = {
        product,
        name,
        quantityType,
        subPackId: '',
        subCount: 0,
        price: 0,
        isArchived: false,
        gift: '',
        unitsCount: +unitsCount
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
      <Header title={`${labels.addPack} ${product.name}`} />
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
        </IonList>
      </IonContent>
      {name && unitsCount && quantityType &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default PackAdd
