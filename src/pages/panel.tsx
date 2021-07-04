import { useContext, useState, useEffect, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'

const Panel = () => {
  const { state, dispatch } = useContext(StateContext)
  const [approvalsCount, setApprovalsAcount] = useState(0)
  const [offersCount, setOffersAcount] = useState(0)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  useEffect(() => {
    const newOrders = state.orders.filter(o => o.status === 'n').length
    const orderRequests = state.orders.filter(r => r.requestType).length
    const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id)).length
    const alarms = state.alarms.filter(a => a.status === 'n').length
    const ratings = state.ratings.filter(r => r.status === 'n').length
    const invitations = state.invitations.filter(i => i.status === 'n').length
    const passwordRequests = state.passwordRequests.length
    const newStoresOwners = state.customers.filter(c => c.storeName && !c.storeId).length
    setApprovalsAcount(newOrders + orderRequests + newUsers + alarms + ratings + invitations + passwordRequests + newStoresOwners)
  }, [state.orders, state.users, state.customers, state.passwordRequests, state.alarms, state.ratings, state.invitations])
  useEffect(() => {
    const today = (new Date()).setHours(0, 0, 0, 0)
    setOffersAcount(() => state.packPrices.filter(p => p.offerEnd && p.offerEnd.setHours(0, 0, 0, 0) <= today).length)
  }, [state.packPrices])

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
          {state.user ? <>
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
