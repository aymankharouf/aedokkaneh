import { useRef, useMemo } from 'react'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { Alarm, CustomerInfo, Order, PackPrice, PasswordRequest, Rating, State, UserInfo } from '../data/types'
import firebase from '../data/firebase'

const Panel = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateAlarms = useSelector<State, Alarm[]>(state => state.alarms)
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  const approvalsCount = useMemo(() => {
    const newOrders = stateOrders.filter(o => o.status === 'n').length
    const orderRequests = stateOrders.filter(r => r.requestType).length
    const newUsers = stateUsers.filter(u => !stateCustomers.find(c => c.id === u.id)).length
    const alarms = stateAlarms.filter(a => a.status === 'n').length
    const ratings = stateRatings.filter(r => r.status === 'n').length
    const passwordRequests = statePasswordRequests.length
    const newStoresOwners = stateCustomers.filter(c => c.storeName && !c.storeId).length
    return newOrders + orderRequests + newUsers + alarms + ratings + passwordRequests + newStoresOwners
  }, [stateOrders, stateUsers, stateCustomers, statePasswordRequests, stateAlarms, stateRatings])
  const today = (new Date()).setHours(0, 0, 0, 0)
  const offersCount = useMemo(() => statePackPrices.filter(p => p.offerEnd && p.offerEnd.setHours(0, 0, 0, 0) <= today).length, [statePackPrices, today])

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
            <IonItem routerLink="/offers" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.offers}</IonLabel>
              {offersCount > 0 && <IonBadge color="danger">{offersCount}</IonBadge>}
            </IonItem>
            <IonItem routerLink="/monthly-operation-call" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.monthlyOperations}</IonLabel>
            </IonItem>
            <IonItem routerLink="/logs" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.logs}</IonLabel>
            </IonItem>
            <IonItem routerLink="/permission-list/s" style={{marginBottom: '0px', marginTop: '0px'}}>
              <IonLabel>{labels.storesOwners}</IonLabel>
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
