import { useRef, useMemo } from 'react'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { Customer, Order, PasswordRequest, Rating, State } from '../data/types'
import firebase from '../data/firebase'

const Panel = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  const approvalsCount = useMemo(() => {
    const newOrders = stateOrders.filter(o => o.status === 'n').length
    const orderRequests = stateOrders.filter(r => r.requestType).length
    const newCustomers = stateCustomers.filter(c => c.status === 'n').length
    const ratings = stateRatings.filter(r => r.status === 'n').length
    const passwordRequests = statePasswordRequests.length
    return newOrders + orderRequests + newCustomers + ratings + passwordRequests
  }, [stateOrders, stateCustomers, statePasswordRequests, stateRatings])
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
            <IonItem routerLink="/requested-packs">
              <IonLabel>{labels.requestedPacks}</IonLabel>
            </IonItem>
            <IonItem routerLink="/purchase-plan" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.purchasePlan}</IonLabel>
            </IonItem>
            <IonItem routerLink="/approvals" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.approvals}</IonLabel>
              {approvalsCount > 0 && <IonBadge color="danger">{approvalsCount}</IonBadge>}
            </IonItem>
            <IonItem routerLink="/monthly-operation-call" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.monthlyOperations}</IonLabel>
            </IonItem>
            <IonItem routerLink="/logs" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.logs}</IonLabel>
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
