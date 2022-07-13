import { useState, useMemo } from 'react'
import { editSpending, getMessage } from '../data/actions'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { IonContent, IonDatetime, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Spending, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const SpendingEdit = () => {
  const params = useParams<Params>()
  const stateSpendings = useSelector<State, Spending[]>(state => state.spendings)
  const [spending] = useState(() => stateSpendings.find(s => s.id === params.id)!)
  const [type, setType] = useState(spending.type)
  const [amount, setAmount] = useState((spending.amount / 100).toFixed(2))
  const [spendingDate, setSpendingDate] = useState(spending.spendingDate.toString())
  const [description, setDescription] = useState(spending.description)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const hasChanged = useMemo(() => (+amount * 100 !== spending.amount)
  || (type !== spending.type)
  || (description !== spending.description)
  || (!spending.spendingDate && spendingDate.length > 0)
  || (spending.spendingDate && spendingDate.length === 0)
  || (spending.spendingDate.toString() !== (new Date(spendingDate)).toString())
  , [spending, amount, spendingDate, type, description])
  const handleSubmit = () => {
    try{
      if (Number(amount) <= 0 || Number(amount) !== Number(Number(amount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const newSpending = {
        ...spending,
        type,
        amount: +amount * 100,
        spendingDate: new Date(spendingDate),
        description
      }
      editSpending(newSpending)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}    
  }
  return (
    <IonPage>
      <Header title={labels.editSpending} />
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
      {amount && type && spendingDate && hasChanged &&
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
export default SpendingEdit
