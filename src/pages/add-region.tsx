import { useState } from 'react'
import { addRegion, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonTextarea, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'

const AddRegion = () => {
  const [name, setName] = useState('')
  const [fees, setFees] = useState('')
  const [ordering, setOrdering] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (Number(fees) < 0 || Number(fees) !== Number(Number(fees).toFixed(2))) {
        throw new Error('invalidValue')
      }
      addRegion({
        id: Math.random().toString(),
        name,
        fees: +fees * 100,
        ordering: +ordering
      })
      message(labels.addSuccess)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addRegion} />
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
      {name && fees && ordering &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}
export default AddRegion
