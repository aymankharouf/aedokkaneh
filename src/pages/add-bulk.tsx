import { useState, useContext, useEffect, ChangeEvent, useRef } from 'react'
import { addPack, getMessage } from '../data/actions'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const AddBulk = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [name, setName] = useState('')
  const [subPackId, setSubPackId] = useState('')
  const [subQuantity, setSubQuantity] = useState('')
  const [specialImage, setSpecialImage] = useState(false)
  const [forSale, setForSale] = useState(true)
  const [image, setImage] = useState<File>()
  const [product] = useState(() => state.products.find(p => p.id === params.id)!)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === params.id && !p.isOffer && !p.byWeight && p.forSale)
    return packs.map(p => {
      return {
        id: p.id,
        name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
  })
  useEffect(() => {
    if (!forSale) setSpecialImage(false)
  }, [forSale])
  const generateName = () => {
    let suggestedName
    if (subPackId && subQuantity) {
      suggestedName = `${+subQuantity > 1 ? subQuantity + '×' : ''}${state.packs.find(p => p.id === subPackId)?.name}`
      if (!name) setName(suggestedName)
    }
  }
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click();
  }
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
      const subPackInfo = state.packs.find(p => p.id === subPackId)!
      if (state.packs.find(p => p.productId === params.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const pack = {
        name,
        productId: product.id!,
        productName: product.name,
        productAlias: product.alias,
        productDescription: product.description,
        categoryId: product.categoryId,
        country: product.country,
        trademark: product.trademark,
        sales: product.sales,
        rating: product.rating,
        ratingCount: product.ratingCount,
        isOffer: false,
        price: 0,
        subPackId,
        subPackName: subPackInfo.name,
        subQuantity: Number(subQuantity),
        subPercent: 1,
        unitsCount: +subQuantity * subPackInfo.unitsCount,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
        forSale,
        isArchived: false,
        imageUrl: product.imageUrl,
        specialImage: false,
        offerEnd: null,
        bonusPackId: '',
        bonusQuantity: 0,
        bonusPercent: 0
      }
      addPack(pack, image, subPackInfo)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addBulk} ${product.name}`} />
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
              {labels.pack}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={subPackId}
              onIonChange={e => setSubPackId(e.detail.value)}
            >
              {packs.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.quantity}
            </IonLabel>
            <IonInput 
              value={subQuantity} 
              type="number" 
              clearInput
              onIonChange={e => setSubQuantity(e.detail.value!)} 
              onBlur={() => generateName()} 
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.forSale}</IonLabel>
            <IonToggle checked={forSale} onIonChange={() => setForSale(s => !s)}/>
          </IonItem>
          {forSale &&
            <IonItem>
              <IonLabel color="primary">{labels.specialImage}</IonLabel>
              <IonToggle checked={specialImage} onIonChange={() => setSpecialImage(s => !s)}/>
            </IonItem>
          }
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
      {name && subPackId && subQuantity  &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddBulk
