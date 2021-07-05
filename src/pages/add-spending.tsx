import { useState } from 'react'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { addSpending, getMessage } from '../data/actions'
import { IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

const AddSpending = () => {
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [spendingDate, setSpendingDate] = useState('')
  const [description, setDescription] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (Number(amount) <= 0 || Number(amount) !== Number(Number(amount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      addSpending({
        type,
        amount: +amount * 100,
        spendingDate: new Date(spendingDate),
        description,
        time: new Date()
      })
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.newSpending} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.amount}
            </IonLabel>
            <IonInput 
              value={amount} 
              type="number" 
              clearInput
              onIonChange={e => setAmount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.type}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={type}
              onIonChange={e => setType(e.detail.value)}
            >
              {spendingTypes.map(t => t.id === '1' ? '' : <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.description}
            </IonLabel>
            <IonInput 
              value={description} 
              type="text" 
              clearInput
              onIonChange={e => setDescription(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.spendingDate}
            </IonLabel>
            <IonDatetime 
              displayFormat="DD/MM/YYYY" 
              value={spendingDate} 
              cancelText={labels.cancel}
              doneText={labels.ok}
              onIonChange={e => setSpendingDate(e.detail.value!)}
            />
          </IonItem>
        </IonList>
      </IonContent>
      {amount && type && spendingDate &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddSpending
