import { useState, useEffect, useMemo } from 'react'
import { editPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const EditPack = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [pack] = useState(() => statePacks.find(p => p.id === params.id)!)
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount.toString())
  const [isDivided, setIsDivided] = useState(pack.isDivided)
  const [byWeight, setByWeight] = useState(pack.byWeight)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const hasChanged = useMemo(() => (name !== pack.name)
    || (+unitsCount !== pack.unitsCount)
    || (isDivided !== pack.isDivided)
    || (byWeight !== pack.byWeight)
  , [pack, name, unitsCount, isDivided, byWeight])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  const handleSubmit = () => {
    try{
      if (statePacks.find(p => p.id !== pack.id && p.product.id === params.id && p.name === name)) {
        throw new Error('duplicateName')
      }
      const newPack = {
        ...pack,
        name,
        unitsCount: +unitsCount,
        isDivided,
        byWeight,
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
            <IonLabel color="primary">{labels.isDivided}</IonLabel>
            <IonToggle checked={isDivided} onIonChange={() => setIsDivided(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.byWeight}</IonLabel>
            <IonToggle checked={byWeight} disabled={isDivided} onIonChange={() => setByWeight(s => !s)}/>
          </IonItem>
        </IonList>
      </IonContent>
      {name && unitsCount && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditPack
