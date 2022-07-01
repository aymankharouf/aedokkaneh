import { useState, useEffect, useMemo } from 'react'
import { addPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, Product, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddPack = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  const handleSubmit = () => {
    try{
      if (statePacks.find(p => p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const pack = {
        product,
        name,
        isDivided,
        byWeight,
        isOffer: false,
        price: 0,
        isArchived: false,
        withGift: false,
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
            <IonLabel color="primary">{labels.isDivided}</IonLabel>
            <IonToggle checked={isDivided} onIonChange={() => setIsDivided(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.byWeight}</IonLabel>
            <IonToggle checked={byWeight} disabled={isDivided} onIonChange={() => setByWeight(s => !s)}/>
          </IonItem>
        </IonList>
      </IonContent>
      {name && unitsCount &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPack
