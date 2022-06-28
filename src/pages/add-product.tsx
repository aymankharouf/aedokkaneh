import { useState, ChangeEvent, useRef, useMemo } from 'react'
import { addProduct, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import SmartSelect from './smart-select'
import { Category, Country, Err, Product, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddProduct = () => {
  const params = useParams<Params>()
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(params.id === '0' ? '' : params.id)
  const [trademark, setTrademark] = useState('')
  const [countryId, setCountryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState<File>()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
  }
  const categories = useMemo(() => stateCategories.filter(c => c.level === 2).sort((c1, c2) => c1.name > c2.name ? 1 : -1), [stateCategories])
  const countries = useMemo(() => stateCountries.sort((c1, c2) => c1.name > c2.name ? 1 : -1), [stateCountries])
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
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
      if (stateProducts.find(p => p.categoryId === categoryId && p.countryId === countryId && p.name === name && p.alias === alias)) {
        throw new Error('duplicateProduct')
      }
      const product = {
        name,
        alias,
        description,
        categoryId,
        trademark,
        countryId,
        sales: 0,
        rating: 0,
        ratingCount: 0,
        isArchived: false,
        imageUrl
      }
      addProduct(product, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
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

          <SmartSelect label={labels.category} data={categories} value={categoryId} onChange={(v) => setCategoryId(v)} />
          <SmartSelect label={labels.country} data={countries} value={countryId} onChange={(v) => setCountryId(v)} />
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
      {name && categoryId && countryId &&
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
