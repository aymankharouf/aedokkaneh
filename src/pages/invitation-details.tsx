import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { approveInvitation, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonList, IonItem, IonContent, IonFab, IonFabButton, IonLabel, IonIcon, IonInput, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'
import { Err } from '../data/types'

type Params = {
  userId: string,
  mobile: string
}
const InvitationDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [userInfo] = useState(() => state.users.find(u => u.id === params.userId)!)
  const [invitation] = useState(() => state.invitations.find(i => i.userId === params.userId && i.mobile === params.mobile)!)
  const [mobileCheck, setMobileCheck] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  useEffect(() => {
    setMobileCheck(() => {
      if (state.users.find(u => u.mobile === params.mobile)) {
        return 'r'
      }
      if (state.invitations.find(i => i.userId !== params.userId && i.mobile === params.mobile)) {
        return 'o'
      }
      return 's'
    })
  }, [state.users, state.customers, state.invitations, params.mobile, params.userId])
  const handleApprove = () => {
    try{
      const newInvitation = {
        ...invitation,
        status: mobileCheck
      }
      approveInvitation(newInvitation, state.invitations)
      message(labels.approveSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }

  return (
    <IonPage>
      <Header title={labels.invitationDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.user}
            </IonLabel>
            <IonInput 
              value={`${userInfo.name}: ${userInfo.mobile}`} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.friendName}
            </IonLabel>
            <IonInput 
              value={invitation.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={params.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobileCheck}
            </IonLabel>
            <IonInput 
              value={mobileCheck === 's' ? labels.notUsedMobile : (mobileCheck === 'r' ? labels.alreadyUser : labels.invitedByOther)} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleApprove} color="success">
          <IonIcon ios={checkmarkOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}
export default InvitationDetails
