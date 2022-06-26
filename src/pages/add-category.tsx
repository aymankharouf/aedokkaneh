import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { addCategory, getMessage } from '../data/actions'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'
import { Category, Err, State } from '../data/types'
import { useSelector } from 'react-redux'
import SmartSelect from './smart-select'

const AddCategory = () => {
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const [name, setName] = useState('')
  const [ordering, setOrdering] = useState('')
  const [parentId, setParentId] = useState('')
  const parentCategories = useMemo(() => stateCategories.filter(c => !c.parentId), [stateCategories])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()

  const handleSubmit = () => {
    try{
      if (stateCategories.find(c => c.name === name)) {
        throw new Error('duplicateName')
      }
      addCategory({
        id: Math.random().toString(),
        name,
        ordering: +ordering,
        parentId
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
      <Header title={labels.addCategory} />
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
          <SmartSelect label={labels.parentCategory} data={parentCategories} onChange={(v) => setParentId(v)} />

        </IonList>
      </IonContent>
      {name && ordering &&
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
export default AddCategory
