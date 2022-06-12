import { useState, useContext, useEffect, ChangeEvent, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { editAdvert, getMessage } from '../data/actions'
import labels from '../data/labels'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonTextarea, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err } from '../data/types'

type Params = {
  id: string
}
const EditAdvert = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [advert] = useState(() => state.adverts.find(a => a.id === params.id)!)
  const [title, setTitle] = useState(advert.title)
  const [text, setText] = useState(advert.text)
  const [imageUrl, setImageUrl] = useState(advert.imageUrl)
  const [image, setImage] = useState<File>()
  const [hasChanged, setHasChanged] = useState(false)
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const onUploadClick = () => {
    if (inputEl.current) inputEl.current.click()
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
  useEffect(() => {
    if (title !== advert.title
    || text !== advert.text
    || imageUrl !== advert.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [advert, title, text, imageUrl])
  const handleSubmit = () => {
    try{
      const newAdvert = {
        ...advert,
        title,
        text,
        imageUrl
      }
      editAdvert(newAdvert, image)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.editAdvert} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.title}
            </IonLabel>
            <IonInput 
              value={title} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setTitle(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.text}
            </IonLabel>
            <IonTextarea 
              value={text} 
              wrap="soft"
              onIonChange={e => setText(e.detail.value!)} 
            />
          </IonItem>
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
        </IonList>
      </IonContent>
      {title && (text || imageUrl) && hasChanged &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} /> 
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default EditAdvert
