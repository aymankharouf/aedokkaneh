import { useState, useContext, useEffect, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { editCountry, getMessage, deleteCountry } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'
import { Err } from '../data/types'

type Params = {
  id: string
}
const EditCountry = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [country] = useState(() => state.countries.find(c => c.id === params.id)!)
  const [name, setName] = useState(country.name)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [hasChanged, setHasChanged] = useState(false)
  const fabList = useRef<HTMLIonFabElement | null>(null)
  useEffect(() => {
    if (hasChanged && fabList.current) fabList.current!.close()
  }, [hasChanged])
  useEffect(() => {
    if (name !== country.name) setHasChanged(true)
    else setHasChanged(false)
  }, [country, name])

  const handleEdit = () => {
    try{
      const newCountry = {
        ...country,
        name
      }
      editCountry(newCountry, state.countries)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            deleteCountry(country.id, state.countries)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })

  }
  return (
    <IonPage>
      <Header title={labels.editCountry} />
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
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed" ref={fabList}>
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="danger" onClick={handleDelete}>
            <IonIcon ios={trashOutline} />
          </IonFabButton>
        </IonFabList>
          {name && hasChanged &&
            <IonFabButton color="success" onClick={handleEdit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          }
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default EditCountry
