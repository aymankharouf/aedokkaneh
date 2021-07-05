import { useState, useContext, ChangeEvent, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { addProduct, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonSelect, IonSelectOption, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const AddProduct = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(params.id === '0' ? '' : params.id)
  const [trademark, setTrademark] = useState('')
  const [country, setCountry] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
  }
  const [categories] = useState(() => {
    const categories = state.categories.filter(c => c.isLeaf)
    return categories.sort((c1, c2) => c1.name > c2.name ? 1 : -1)
  })
  const [countries] = useState(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      throw new Error('invalidFile')
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      if (fileReader.result) setImageUrl(fileReader.result.toString())
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handleSubmit = () => {
    try{
      if (state.products.find(p => p.categoryId === categoryId && p.country === country && p.name === name && p.alias === alias)) {
        throw new Error('duplicateProduct')
      }
      const product = {
        name,
        alias,
        description,
        categoryId,
        trademark,
        country,
        sales: 0,
        rating: 0,
        ratingCount: 0,
        isArchived: false,
        imageUrl
      }
      addProduct(product, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.addProduct} />
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
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.alias}
            </IonLabel>
            <IonInput 
              value={alias} 
              type="text" 
              clearInput
              onIonChange={e => setAlias(e.detail.value!)} 
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
              {labels.trademark}
            </IonLabel>
            <IonInput 
              value={trademark} 
              type="text" 
              clearInput
              onIonChange={e => setTrademark(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.category}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={categoryId}
              onIonChange={e => setCategoryId(e.detail.value)}
            >
              {categories.map(c => <IonSelectOption key={c.id} value={c.id}>{c.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.country}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={country}
              onIonChange={e => setCategoryId(e.detail.value)}
            >
              {countries.map(c => <IonSelectOption key={c} value={c}>{c}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <input 
            ref={inputEl}
            type="file" 
            accept="image/*" 
            style={{display: "none" }}
            onChange={e => handleFileChange(e)}
          />
          <IonButton 
            expand="block" 
            fill="clear" 
            onClick={onUploadClick}
          >
            {labels.setImage}
          </IonButton>
          <IonImg src={imageUrl} alt={labels.noImage} />
        </IonList>
      </IonContent>
      {name && categoryId && country &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddProduct
