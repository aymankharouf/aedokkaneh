import { useState, useContext, useEffect } from 'react'
import { editRegion, getMessage } from '../data/actions'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonTextarea, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditRegion = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [region] = useState(() => state.regions.find(r => r.id === params.id)!)
  const [name, setName] = useState(region.name)
  const [fees, setFees] = useState((region.fees / 100).toFixed(2))
  const [ordering, setOrdering] = useState(region.ordering.toString())
  const [hasChanged, setHasChanged] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    if (name !== region.name
    || +fees * 100 !== region.fees
    || +ordering !== region.ordering) setHasChanged(true)
    else setHasChanged(false)
  }, [region, name, fees, ordering])
  const handleEdit = () => {
    try{
      if (Number(fees) < 0 || Number(fees) !== Number(Number(fees).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const newRegion = {
        ...region,
        name,
        fees: +fees * 100,
        ordering: +ordering
      }
      editRegion(newRegion, state.regions)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editRegion} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.deliveryFees}
            </IonLabel>
            <IonInput 
              value={fees} 
              type="number" 
              clearInput
              onIonChange={e => setFees(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.ordering}
            </IonLabel>
            <IonInput 
              value={ordering} 
              type="number" 
              clearInput
              onIonChange={e => setOrdering(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {name && fees && ordering && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleEdit} color="success">
            <IonIcon ios={checkmarkOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}
export default EditRegion
