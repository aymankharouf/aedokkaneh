import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { useEffect, useState } from 'react'
import labels from '../data/labels'
import Fuse from "fuse.js"
import { chevronForwardOutline } from 'ionicons/icons'

type Element = {
  id: string,
  name: string
}
type Props = {
  label: string,
  data: Element[],
  onChange: (v: string) => void
}
const SmartSelect = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState('')
  const [searchText, setSearchText] = useState('')
  const [values, setValues] = useState<Element[]>([])
  useEffect(() => {
    if (!searchText) {
      setValues(props.data)
      return
    }
    const options = {
      includeScore: true,
      findAllMatches: true,
      threshold: 0.1,
      keys: ['name']
    }
    const fuse = new Fuse(props.data, options)
    const result = fuse.search(searchText)
    setValues(result.map(p => p.item))
  }, [searchText, props.data])

  const handleSelect = (i: Element) => {
    setValue(i.name)
    setIsOpen(false)
    props.onChange(i.id)
  }
  return (
    <>
      <IonModal isOpen={isOpen} animated mode="ios">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon
                  ios={chevronForwardOutline} 
                  color="primary" 
                  style={{fontSize: '20px', marginRight: '10px'}} 
                />
              </IonButton>
            </IonButtons>
            <IonTitle>{props.label}</IonTitle>
          </IonToolbar>
          <IonToolbar>
          <IonSearchbar
            placeholder={labels.search} 
            value={searchText} 
            onIonChange={e => setSearchText(e.detail.value!)}
          />
        </IonToolbar>

        </IonHeader>
        <IonContent fullscreen className="ion-padding">
          <IonList>
            {values.map(i => 
              <IonItem key={i.id} detail onClick={() => handleSelect(i)}>
                <IonLabel>{i.name}</IonLabel>
              </IonItem>
            )}
          </IonList>
        </IonContent>
      </IonModal>
      <IonItem>
        <IonLabel position="floating" color="primary">
          {props.label}
        </IonLabel>
        <IonInput 
          value={value} 
          type="text" 
          clearInput
          onClick={() => setIsOpen(true)} 
        />
      </IonItem>
    </>
  )
}

export default SmartSelect