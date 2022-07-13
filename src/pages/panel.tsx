import { useRef, useMemo } from 'react'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { Log, PasswordRequest, Rating, State, StoreTrans } from '../data/types'
import firebase from '../data/firebase'

const Panel = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const stateStoreTrans = useSelector<State, StoreTrans[]>(state => state.storeTrans)
  const stateLogs = useSelector<State, Log[]>(state => state.logs)
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  const approvalsCount = useMemo(() => {
    const ratings = stateRatings.filter(r => r.status === 'n').length
    const passwordRequests = statePasswordRequests.length
    const storeTrans = stateStoreTrans.filter(t => t.status === 'n').length
    return ratings + passwordRequests + storeTrans
  }, [statePasswordRequests, stateRatings, stateStoreTrans])
  const handleLogout = () => {
    logout()
    history.push('/')
    if (menuEl.current) menuEl.current.close()
    dispatch({type: 'CLEAR_BASKET'})
  }

  return(
    <IonMenu contentId="main" type="overlay" ref={menuEl} className="dark">
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
          {stateUser ? <>
            <IonItem href="#" onClick={handleLogout}>
              <IonLabel style={{marginBottom: '5px'}}>{labels.logout}</IonLabel>
            </IonItem>
            <IonItem routerLink="/settings" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.settings}</IonLabel>
            </IonItem>
            <IonItem routerLink="/approval-list" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.approvals}</IonLabel>
              {approvalsCount > 0 && <IonBadge color="danger">{approvalsCount}</IonBadge>}
            </IonItem>
            <IonItem routerLink="/order-stat" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.orders}</IonLabel>
            </IonItem>
            <IonItem routerLink="/monthly-operation-call" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.monthlyOperations}</IonLabel>
            </IonItem>
            <IonItem routerLink="/logs" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.logs}</IonLabel>
              {stateLogs.length > 0 && <IonBadge color="danger">{stateLogs.length}</IonBadge>}
            </IonItem>
          </> : 
            <IonItem routerLink='/login'>
              <IonLabel>{labels.login}</IonLabel>
            </IonItem>
          }
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  )
}
export default Panel
