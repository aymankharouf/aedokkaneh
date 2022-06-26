import { useMemo } from 'react'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { deleteNotification, getMessage } from '../data/actions'
import { Err, Notification, State, UserInfo } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { colors } from '../data/config'
import { addOutline, trashOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import firebase from '../data/firebase'

const Notifications = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateNotifications = useSelector<State, Notification[]>(state => state.notifications)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const notifications = useMemo(() => stateNotifications.map(n => {
                                                          const userInfo = stateUsers.find(u => u.id === n.userId)!
                                                          return {
                                                            ...n,
                                                            userInfo
                                                          }
                                                        })
                                                        .sort((n1, n2) => n2.time > n1.time ? 1 : -1)
  , [stateUsers, stateNotifications])
  const handleDelete = (notificationId: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            const notification = stateNotifications.find(n => n.id === notificationId)!
            deleteNotification(notification, stateNotifications)
            message(labels.deleteSuccess, 3000)
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }

  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return (
    <IonPage>
      <Header title={labels.notifications} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {notifications.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : notifications.map(n =>
              <IonItem key={n.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{`${n.userInfo.name}:${n.userInfo.mobile}`}</IonText>
                  <IonText style={{color: colors[1].name}}>{n.title}</IonText>
                  <IonText style={{color: colors[2].name}}><p>{n.text}</p></IonText>
                  <IonText style={{color: colors[3].name}}>{n.status === 'n' ? labels.notRead : labels.read}</IonText>
                  <IonText style={{color: colors[4].name}}>{moment(n.time).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(n.id)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-notification" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Notifications
