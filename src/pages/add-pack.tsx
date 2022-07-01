import { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react'
import { addPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, Product, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddPack = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [name, setName] = useState('')
  const [unitsCount, setUnitsCount] = useState('')
  const [isDivided, setIsDivided] = useState(false)
  const [byWeight, setByWeight] = useState(false)
  const [closeExpired, setCloseExpired] = useState(false)
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const inputEl = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  }
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
      if (statePacks.find(p => p.productId === params.id && p.name === name && p.closeExpired === closeExpired)) {
        throw new Error('duplicateName')
      }
      const pack = {
        product,
        name,
        productId: product.id!,
        productName: product.name,
        categoryId: product.categoryId,
        countryId: product.countryId,
        trademark: product.trademark,
        sales: product.sales,
        rating: product.rating,
        ratingCount: product.ratingCount,    
        unitsCount: +unitsCount,
        isDivided,
        closeExpired,
        byWeight,
        isOffer: false,
        price: 0,
        isArchived: false,
        imageUrl: product.imageUrl,
        specialImage: false,
        subPackId: '',
        offerEnd: null,
        subQuantity: 0,
        withGift: false,
        gift: ''
      }
      addPack(pack, image)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addPack} ${product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.unitsCount}
            </IonLabel>
            <IonInput 
              value={unitsCount} 
              type="number" 
              clearInput
              onIonChange={e => setUnitsCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isDivided}</IonLabel>
            <IonToggle checked={isDivided} onIonChange={() => setIsDivided(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.byWeight}</IonLabel>
            <IonToggle checked={byWeight} disabled={isDivided} onIonChange={() => setByWeight(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.closeExpired}</IonLabel>
            <IonToggle checked={closeExpired} onIonChange={() => setCloseExpired(s => !s)}/>
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.specialImage}</IonLabel>
            <IonToggle checked={specialImage} onIonChange={() => setSpecialImage(s => !s)}/>
          </IonItem>
          {specialImage && <>
            <input 
              ref={inputEl}
              type="file" 
              accept="image/*" 
              style={{display: "none"}}
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
          </>}
        </IonList>
      </IonContent>
      {name && unitsCount &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddPack
