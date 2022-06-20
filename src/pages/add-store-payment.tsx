import { useState } from 'react'
import { addStorePayment, getMessage } from '../data/actions'
import labels from '../data/labels'
import { paymentTypes } from '../data/config'
import { IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, State, Store } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddStorePayment = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [store] = useState(() => stateStores.find(s => s.id === params.id)!)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const handleSubmit = () => {
    try{
      if (Number(amount) <= 0 || Number(amount) !== Number(Number(amount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const payment = {
        type,
        storeId: store.id!,
        description,
        amount: +amount * 100,
        paymentDate: new Date(paymentDate),
        time: new Date()
      }
      addStorePayment( payment, stateStores)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addPayment} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
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
              {paymentTypes.map(t => t.id === '1' ? '' : <IonSelectOption key={t.id} value={t.id}>{t.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
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
              {labels.paymentDate}
            </IonLabel>
            <IonDatetime 
              displayFormat="DD/MM/YYYY" 
              value={paymentDate} 
              cancelText={labels.cancel}
              doneText={labels.ok}
              onIonChange={e => setPaymentDate(e.detail.value!)}
            />
          </IonItem>
        </IonList>
      </IonContent>
      {amount && type && paymentDate &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddStorePayment
