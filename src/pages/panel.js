import React, { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { logout } from '../data/actions'
import labels from '../data/labels'

const Panel = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const [approvalsCount, setApprovalsAcount] = useState('')
  const [offersCount, setOffersAcount] = useState('')
  useEffect(() => {
    const newOrders = state.orders.filter(o => o.status === 'n').length
    const orderRequests = state.orders.filter(r => r.requestStatus === 'n').length
    const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id)).length
    const alarms = state.users.filter(u => u.alarms?.find(i => i.status === 'n')).length
    const ratings = state.users.filter(u => u.ratings?.find(r => r.status === 'n')).length
    const invitations = state.users.filter(u => u.invitations?.find(i => i.status === 'n')).length
    const debitRequests = state.users.filter(u => u.debitRequestStatus === 'n').length
    const passwordRequests = state.passwordRequests.filter(r => r.status === 'n').length
    const newStoresOwners = state.customers.filter(c => c.storeName && !c.storeId).length
    setApprovalsAcount(newOrders + orderRequests + newUsers + alarms + ratings + invitations + debitRequests + passwordRequests + newStoresOwners)
  }, [state.orders, state.users, state.customers, state.passwordRequests])
  useEffect(() => {
    const today = (new Date()).setHours(0, 0, 0, 0)
    setOffersAcount(() => state.storePacks.filter(p => p.offerEnd && p.offerEnd.toDate().setHours(0, 0, 0, 0) <= today).length)
  }, [state.storePacks])

  const handleLogout = () => {
    logout().then(() => {
      f7.views.main.router.navigate('/home/', {reloadAll: true})
      f7.panel.close('right') 
      dispatch({type: 'CLEAR_BASKET'})
    })
  }

  return(
    <Page>
      <Navbar title={labels.mainPanelTitle} />
      <List>
        {user ? 
          <ListItem link="#" title={labels.logout} onClick={() => handleLogout()} />
        : 
          <ListItem link="/panel-login/" title={labels.login} />
        }
        {user ? <ListItem link="/settings/" title={labels.settings} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/requested-packs/" title={labels.requestedPacks} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/purchase-plan/" title={labels.purchasePlan} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/approvals/" title={labels.approvals} badge={approvalsCount} badgeColor="red" view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/offers/" title={labels.offers} badge={offersCount} badgeColor="red" view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/profits/" title={labels.profits} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/logs/" title={labels.logs} view="#main-view" panelClose /> : ''}
        {user ? <ListItem link="/permission-list/s" title={labels.storesOwners} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
