import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { updateAdvertStatus, getMessage, deleteAdvert } from '../data/actions'
import { advertType } from '../data/config'
import { Advert, Err } from '../data/types'
import { IonActionSheet, IonButtons, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { addOutline, ellipsisVerticalOutline } from 'ionicons/icons'
import { useHistory, useLocation } from 'react-router'

const Adverts = () => {
  const { state } = useContext(StateContext)
  const [currentAdvert, setCurrentAdvert] = useState<Advert>()
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [actionsOpened, setActionsOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  useEffect(() => {
    setAdverts(() => [...state.adverts].sort((a1, a2) => a2.time > a1.time ? 1 : -1))
  }, [state.adverts])
  const handleAction = (advert: Advert) => {
    setCurrentAdvert(advert)
    setActionsOpened(true)
  }
  const handleUpdate = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            if (!currentAdvert) return
            updateAdvertStatus(currentAdvert, state.adverts)
            message(labels.editSuccess, 3000)
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }
        }},
      ],
    })
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            if (!currentAdvert) return
            deleteAdvert(currentAdvert)
            message(labels.deleteSuccess, 3000)
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={labels.adverts} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {adverts.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : adverts.map(a =>
              <IonItem key={a.id} className={currentAdvert && currentAdvert.id === a.id ? 'selected' : ''}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{advertType.find(t => t.id === a.type)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{a.title}</IonText>
                  <IonText style={{color: colors[2].name}}>{a.text}</IonText>
                  <IonText style={{color: colors[3].name}}>{a.isActive ? labels.isActive : labels.inActive}</IonText>
                  <IonText style={{color: colors[4].name}}>{moment(a.time).fromNow()}</IonText>
                </IonLabel>
                <IonButtons slot="end" onClick={() => handleAction(a)}>
                    <IonIcon 
                      ios={ellipsisVerticalOutline}
                      color="primary" 
                      style={{fontSize: '25px', marginRight: '5px'}} 
                    />
                  </IonButtons>

              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-advert" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        isOpen={actionsOpened}
        onDidDismiss={() => setActionsOpened(false)}
        buttons={[
          {
            text: labels.details,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/advert-details/${currentAdvert?.id}`)
          },
          {
            text: labels.delete,
            cssClass: colors[i++ % 10].name,
            handler: () => handleDelete()
          },
          {
            text: currentAdvert?.isActive ? labels.stop : labels.activate,
            cssClass: colors[i++ % 10].name,
            handler: () => handleUpdate()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default Adverts
