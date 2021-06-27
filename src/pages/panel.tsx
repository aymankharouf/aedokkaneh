import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { logout } from '../data/actions'
import labels from '../data/labels'

const Panel = () => {
  const { state, dispatch } = useContext(StateContext)
  const [approvalsCount, setApprovalsAcount] = useState(0)
  const [offersCount, setOffersAcount] = useState(0)
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
    f7.views.main.router.navigate('/home/', {reloadAll: true})
    f7.panel.close('right') 
    dispatch({type: 'CLEAR_BASKET'})
  }

  return(
    <Page>
      <Navbar title={labels.mainPanelTitle} />
      <List>
        {state.user ? <ListItem link="#" title={labels.logout} onClick={() => handleLogout()} />
        : <ListItem link="/panel-login/" title={labels.login} />}
        {state.user ? <ListItem link="/settings/" title={labels.settings} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/requested-packs/" title={labels.requestedPacks} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/purchase-plan/" title={labels.purchasePlan} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/approvals/" title={labels.approvals} badge={approvalsCount} badgeColor="red" view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/offers/" title={labels.offers} badge={offersCount} badgeColor="red" view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/monthly-operation-call/" title={labels.monthlyOperations} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/logs/" title={labels.logs} view="#main-view" panelClose /> : ''}
        {state.user ? <ListItem link="/permission-list/s" title={labels.storesOwners} view="#main-view" panelClose /> : ''}
      </List>
    </Page>
  )
}
export default Panel
