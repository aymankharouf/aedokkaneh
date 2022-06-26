import {useState, useMemo} from 'react'
import {login, getMessage} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonButtons, IonContent, IonFooter, IonInput, IonItem, IonLabel, IonList, IonPage, IonToolbar, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { patterns } from '../data/config'
import { Err } from '../data/types'

const Login = () => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const passwordInvalid = useMemo(() => !password || !patterns.password.test(password), [password])
  const emailInvalid = useMemo(() => !email || !patterns.email.test(email), [email])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [loading, dismiss] = useIonLoading()
  const handleLogin = async () => {
    try{
      loading()
      await login(email, password)
      dismiss()
      message(labels.loginSuccess, 3000)
      history.replace('/')
    } catch (error){
      dismiss()
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return (
    <IonPage>
      <Header title={labels.login} />
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
        {!emailInvalid && !passwordInvalid && 
          <div className="ion-padding" style={{textAlign: 'center'}}>
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              onClick={handleLogin}
            >
              {labels.login}
            </IonButton>
          </div>
        }
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace('/register')}>
              {labels.newUser}
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.replace('/change-password')}>
              {labels.changePassword}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}
export default Login
