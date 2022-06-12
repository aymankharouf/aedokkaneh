import { useContext, useState } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { addTrademark, getMessage } from '../data/actions'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err } from '../data/types'


const AddTrademark = () => {
  const { state } = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [name, setName] = useState('')
  const handleSubmit = () => {
    try{
      if (state.trademarks.filter(t => t.name === name).length > 0) {
        throw new Error('duplicateName')
      }
      addTrademark({
        id: Math.random().toString(),
        name
      })
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addTrademark} />
      <IonContent fullscreen className="ion-padding">
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
        </IonList>
        {name && 
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton onClick={handleSubmit} color="success">
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          </IonFab>
        }
      </IonContent>
    </IonPage>
  )
}
export default AddTrademark
