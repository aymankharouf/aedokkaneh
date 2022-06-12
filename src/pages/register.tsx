import { useState, useEffect } from 'react'
import { registerUser, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { patterns } from '../data/config'
import { Err } from '../data/types'

const Register = () => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [passwordInvalid, setPasswordInvalid] = useState(true)
  const [emailInvalid, setEmailInvalid] = useState(true)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [loading, dismiss] = useIonLoading()
  useEffect(() => {
    setPasswordInvalid(!password || !patterns.password.test(password))
  }, [password])
  useEffect(() => {
    setEmailInvalid(!email || !patterns.email.test(email))
  }, [email])
  const handleRegister = async () => {
    try{
      loading()
      await registerUser(email, password)
      dismiss()
      message(labels.registerSuccess, 3000)
      history.replace('/') 
    } catch (error){
      dismiss()
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.registerTitle} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color={emailInvalid ? 'danger' : 'primary'}>
              {labels.email}
            </IonLabel>
            <IonInput 
              value={email} 
              type="text" 
              autofocus
              clearInput
              onIonChange={e => setEmail(e.detail.value!)} 
              color={emailInvalid ? 'danger' : ''}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color={passwordInvalid ? 'danger' : 'primary'}>
              {labels.password}
            </IonLabel>
            <IonInput 
              value={password} 
              type="text" 
              clearInput
              onIonChange={e => setPassword(e.detail.value!)} 
              color={passwordInvalid ? 'danger' : ''}
            />
          </IonItem>
        </IonList>
      </IonContent>
      {!emailInvalid && !passwordInvalid &&
        <div className="ion-padding" style={{textAlign: 'center'}}>
          <IonButton 
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            onClick={handleRegister}
          >
            {labels.register}
          </IonButton>
        </div>
      }
    </IonPage>
  )
}
export default Register
