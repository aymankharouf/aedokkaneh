import { useContext, useState } from 'react'
import { sendNotification, getMessage } from '../data/actions'
import labels from '../data/labels'
import { StateContext } from '../data/state-provider'
import { useHistory, useLocation } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'


const AddNotification = () => {
  const { state } = useContext(StateContext)
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [customers] = useState(() => [...state.customers].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      sendNotification(userId, title, text)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addNotification} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.toCustomer}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={userId}
              onIonChange={e => setUserId(e.detail.value)}
            >
              {customers.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.title}
            </IonLabel>
            <IonInput 
              value={title} 
              type="text" 
              clearInput
              onIonChange={e => setTitle(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.text}
            </IonLabel>
            <IonInput 
              value={text} 
              type="text" 
              clearInput
              onIonChange={e => setText(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {userId && title && text &&
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
export default AddNotification
