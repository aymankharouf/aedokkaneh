import { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react'
import { addPack, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, Product, State } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const AddOffer = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [subPackId, setSubPackId] = useState('')
  const [subQuantity, setSubQuantity] = useState('')
  const [withGift, setWithGift] = useState(false)
  const [gift, setGift] = useState('')
  const [specialImage, setSpecialImage] = useState(false)
  const [image, setImage] = useState<File>()
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const packs = useMemo(() => statePacks.filter(p => p.productId === params.id && !p.isOffer && !p.byWeight)
  .map(p => {
    return {
      id: p.id,
      name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
    }
  }), [statePacks, params.id])
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  useEffect(() => {
    setImageUrl(() => statePacks.find(p => p.id === subPackId)?.imageUrl || '')
  }, [statePacks, subPackId])
  const name = useMemo(() => {
    let suggestedName = ''
    if (subPackId && subQuantity) {
      suggestedName = `${+subQuantity > 1 ? subQuantity + '×' : ''}${statePacks.find(p => p.id === subPackId)!.name}`
    }
    if (withGift) {
      suggestedName += ' + ' + gift 
    }
    return suggestedName
  }, [subPackId, subQuantity, withGift, gift, statePacks])
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
      const subPackInfo = statePacks.find(p => p.id === subPackId)!
      if (statePacks.find(p => p.productId === params.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (!withGift && Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const pack = {
        name,
        productId: product.id!,
        productName: product.name,
        productAlias: product.alias,
        productDescription: product.description,
        categoryId: product.categoryId,
        countryId: product.countryId,
        trademark: product.trademark,
        sales: product.sales,
        rating: product.rating,
        ratingCount: product.ratingCount,
        isOffer: true,
        subPackId,
        subQuantity: +subQuantity,
        withGift,
        gift,
        unitsCount: +subQuantity * subPackInfo.unitsCount,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
        price: 0,
        isArchived: false,
        imageUrl: product.imageUrl,
        specialImage: false,
        offerEnd: null
      }
      addPack(pack, image, subPackInfo)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.addOffer} ${product.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              readonly
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
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.withGift}</IonLabel>
            <IonToggle checked={withGift} onIonChange={() => setWithGift(s => !s)}/>
          </IonItem>
          {withGift &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.gift}
              </IonLabel>
              <IonInput 
                value={gift} 
                type="text" 
                clearInput
                onIonChange={e => setGift(e.detail.value!)} 
                />
            </IonItem>
          }
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
      {name && subPackId && subQuantity && (!withGift || gift) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddOffer
