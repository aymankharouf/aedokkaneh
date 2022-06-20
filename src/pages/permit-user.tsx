import { useState, useEffect } from 'react'
import { permitUser, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast, useIonLoading, IonButton } from '@ionic/react'
import { useHistory, useLocation, useParams } from 'react-router'
import Header from './header'
import { CustomerInfo, Err, State, Store, UserInfo } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const PermitUser = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [userId, setUserId] = useState(params.id === '0' ? '' : params.id)
  const [customerInfo] = useState(() => stateCustomers.find(c => c.id === params.id)!)
  const [storeId, setStoreId] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [users] = useState(() => {
    const users = stateUsers.map(u => {
      return {
        ...u,
        name: `${u.name}${u.storeName ? '-' + u.storeName : ''}:${u.mobile}`
      }
    })
    return users.sort((u1, u2) => u1.name > u2.name ? 1 : -1)
  })
  const [stores] = useState(() => {
    const stores = stateStores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }) 
  useEffect(() => {
    setStoreId(params.id === '0' ? '' : (customerInfo.storeId || ''))
  }, [customerInfo, params.id])
  useEffect(() => {
    if (userId) {
      setStoreId(stateCustomers.find(c => c.id === userId)?.storeId || '')
    } else {
      setStoreId('')
    }
  }, [userId, stateCustomers])
  const handlePermit = async () => {
    try{
      loading()
      await permitUser(userId, storeId, stateUsers, stateStores)
      dismiss()
      message(labels.permitSuccess, 3000)
      history.goBack()
    } catch (error){
      dismiss()
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.permitUser} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.user}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={userId}
              onIonChange={e => setUserId(e.detail.value)}
              disabled={params.id !== '0'}
            >
              {users.map(u => <IonSelectOption key={u.id} value={u.id}>{u.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.store}
            </IonLabel>
            <IonSelect 
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={storeId}
              onIonChange={e => setStoreId(e.detail.value)}
            >
              {stores.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
      {userId && storeId &&
        <div className="ion-padding" style={{textAlign: 'center'}}>
          <IonButton 
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            onClick={handlePermit}
          >
            {labels.permit}
          </IonButton>
        </div>    
      }
    </IonPage>
  )
}
export default PermitUser
