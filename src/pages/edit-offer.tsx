import { useState, useContext, useEffect, ChangeEvent, useRef } from 'react'
import { editPack, getMessage } from '../data/actions'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSelect, IonSelectOption, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const EditOffer = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id)!)
  const [name, setName] = useState(pack.name)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity.toString())
  const [subPercent, setSubPercent] = useState((pack.subPercent * 100).toString())
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity.toString())
  const [bonusPercent, setBonusPercent] = useState((pack.bonusPercent * 100).toString())
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(pack.specialImage)
  const [image, setImage] = useState<File>()
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === pack.productId && !p.isOffer && !p.byWeight && p.forSale)
    return packs.map(p => {
      return {
        id: p.id,
        name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
  })
  const [bonusPacks] = useState(() => {
    const packs = state.packs.filter(p => p.productId !== pack.productId && !p.subPackId && !p.byWeight)
    const result = packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
    return result.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  useEffect(() => {
    if (name !== pack.name
    || subPackId !== pack.subPackId
    || +subQuantity !== pack.subQuantity
    || +subPercent !== pack.subPercent * 100
    || bonusPackId !== pack.bonusPackId
    || +bonusQuantity !== pack.bonusQuantity * 100
    || +bonusPercent !== pack.bonusPercent
    || specialImage !== pack.specialImage
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, subPackId, subQuantity, subPercent, bonusPackId, bonusQuantity, bonusPercent, specialImage, imageUrl])
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
      const bonusPackInfo = state.packs.find(p => p.id === bonusPackId)
      if (state.packs.find(p => p.id !== pack.id && p.productId === params.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (Number(subPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      if (bonusPackInfo && Number(bonusPercent) === 0) {
        throw new Error('invalidPercents')
      }
      if (bonusPackInfo && Number(bonusQuantity) === 0) {
        throw new Error('invalidQuantity')
      }
      if (!bonusPackInfo && Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: +subQuantity * subPackInfo.unitsCount,
        subPercent: +subPercent / 100,
        subPackName: subPackInfo.name,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
        bonusPackId,
        bonusProductName: bonusPackInfo?.productName || '',
        bonusPackName: bonusPackInfo?.name || '',
        bonusQuantity: +bonusQuantity,
        bonusPercent: +bonusPercent / 100
      }
      editPack(newPack, pack, state.packs, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={`${labels.editOffer} ${pack.productName}`} />
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
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.percent}
            </IonLabel>
            <IonInput 
              value={subPercent} 
              type="number" 
              clearInput
              onIonChange={e => setSubPercent(e.detail.value!)} 
            />
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
        <IonListHeader>
          <IonLabel>{labels.bonusProduct}</IonLabel>
        </IonListHeader>
        <IonList>
        <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.pack}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={bonusPackId}
              onIonChange={e => setBonusPackId(e.detail.value)}
            >
              {bonusPacks.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.quantity}
            </IonLabel>
            <IonInput 
              value={bonusQuantity} 
              type="number" 
              clearInput
              onIonChange={e => setBonusQuantity(e.detail.value!)} 
           />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.percent}
            </IonLabel>
            <IonInput 
              value={bonusPercent} 
              type="number" 
              clearInput
              onIonChange={e => setBonusPercent(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {name && subPackId && subQuantity && subPercent && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditOffer
