import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { editCategory, getMessage, getCategoryName } from '../data/actions'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonToggle, IonPage, IonSelect, IonSelectOption, IonTextarea, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditCategory = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [category] = useState(() => state.categories.find(c => c.id === params.id)!)
  const [name, setName] = useState(category.name)
  const [ordering, setOrdering] = useState(category.ordering.toString())
  const [parentId, setParentId] = useState(category.parentId)
  const [isActive, setIsActive] = useState(category.isActive)
  const [hasChanged, setHasChanged] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [categories] = useState(() => {
    const categories = state.categories.filter(c => c.id !== params.id)
    const result = categories.map(c => {
      return {
        id: c.id,
        name: getCategoryName(c, state.categories)
      }
    })
    return result.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  useEffect(() => {
    if (name !== category.name
    || +ordering !== category.ordering
    || parentId !== category.parentId
    || isActive !== category.isActive) setHasChanged(true)
    else setHasChanged(false)
  }, [category, name, ordering, parentId, isActive])
  const handleEdit = () => {
    try{
      const newCategory = {
        ...category,
        parentId,
        name,
        ordering: +ordering,
        isActive
      }
      editCategory(newCategory, category, state.categories)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <IonPage>
      <Header title={labels.editCategory} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mainCategory}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={parentId}
              onIonChange={e => setParentId(e.detail.value)}
            >
              {categories.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
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
              autofocus
              clearInput
              onIonChange={e => setOrdering(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={isActive} onIonChange={() => setIsActive(s => !s)}/>
          </IonItem>
        </IonList>
      </IonContent>
      {name && ordering && hasChanged &&
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
export default EditCategory
