import { useState, useContext } from 'react'
import { StateContext } from '../data/state-provider'
import { approveUser, deleteUser, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast, useIonLoading, useIonAlert, IonFabList } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const ApproveUser = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [userInfo] = useState(() => state.users.find(u => u.id === params.id)!)
  const [name, setName] = useState(userInfo.name)
  const [regionId, setRegionId] = useState(userInfo.regionId)
  const [address, setAddress] = useState('')
  const [regions] = useState(() => [...state.regions].sort((l1, l2) => l1.ordering - l2.ordering))
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [loading, dismiss] = useIonLoading()
  const [alert] = useIonAlert()
  const handleSubmit = () => {
    try {
      approveUser(params.id, name, userInfo.mobile, regionId, userInfo.storeName, address, state.users, state.invitations)
      message(labels.approveSuccess)
      history.goBack()  
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: async () => {
          try{
            loading()
            await deleteUser(userInfo, state.orders)
            dismiss()
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(err) {
            dismiss()
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  return (
    <IonPage>
      <Header title={labels.approveUser} />
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
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={userInfo.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.storeName}
            </IonLabel>
            <IonInput 
              value={userInfo.storeName} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.region}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={regionId}
              onIonChange={e => setRegionId(e.detail.value)}
            >
              {regions.map(r => <IonSelectOption key={r.id} value={r.id}>{r.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={address} 
              type="text" 
              clearInput
              onIonChange={e => setAddress(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="danger" onClick={handleDelete}>
            <IonIcon ios={trashOutline} />
          </IonFabButton>
          {name && regionId &&
            <IonFabButton color="success" onClick={handleSubmit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          }
        </IonFabList>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default ApproveUser
