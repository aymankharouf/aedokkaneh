import { useState, useEffect, useRef } from 'react'
import { editCategory, getMessage, deleteCategory } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonAlert, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline, chevronDownOutline, trashOutline } from 'ionicons/icons'
import { Category, Err, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const EditCategory = () => {
  const params = useParams<Params>()
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const [category] = useState(() => stateCategories.find(c => c.id === params.id)!)
  const [name, setName] = useState(category.name)
  const [ordering, setOrdering] = useState(category.ordering.toString())
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
    if (name !== category.name
    || +ordering !== category.ordering) setHasChanged(true)
    else setHasChanged(false)
  }, [category, name, ordering])

  const handleEdit = () => {
    try{
      const newCategory = {
        ...category,
        name,
        ordering: +ordering
      }
      editCategory(newCategory, stateCategories)
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
            deleteCategory(category.id, stateCategories)
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
      <Header title={labels.editCategory} />
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
      <IonFab horizontal="end" vertical="top" slot="fixed" ref={fabList}>
        <IonFabButton>
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="danger" onClick={handleDelete}>
            <IonIcon ios={trashOutline} />
          </IonFabButton>
        </IonFabList>
          {name && ordering && hasChanged &&
            <IonFabButton color="success" onClick={handleEdit}>
              <IonIcon ios={checkmarkOutline} />
            </IonFabButton>
          }
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default EditCategory
