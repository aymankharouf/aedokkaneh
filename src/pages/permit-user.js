import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, Button } from 'framework7-react'
import { permitUser, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { StoreContext } from '../data/store'

const PermitUser = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userId, setUserId] = useState(props.id === '0' ? '' : props.id)
  const [customerInfo] = useState(() => state.customers.find(c => c.id === props.id))
  const [storeId, setStoreId] = useState('')
  const [users] = useState(() => {
    const users = state.users.map(u => {
      return {
        ...u,
        name: `${u.name}${u.storeName ? '-' + u.storeName : ''}:${u.mobile}`
      }
    })
    return users.sort((u1, u2) => u1.name > u2.name ? 1 : -1)
  })
  const [stores] = useState(() => {
    const stores = state.stores.filter(s => s.id !== 's')
    return stores.sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  }) 
  useEffect(() => {
    setStoreId(props.id === '0' ? '' : (customerInfo.storeId || ''))
  }, [customerInfo, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])
  useEffect(() => {
    if (userId) {
      setStoreId(state.customers.find(c => c.id === userId).storeId || '')
    } else {
      setStoreId('')
    }
  }, [userId, state.customers])
  const handlePermit = async () => {
    try{
      setInprocess(true)
      await permitUser(userId, storeId, state.users, state.stores)
      setInprocess(false)
      showMessage(labels.permitSuccess)
      f7.views.current.router.back()
    } catch (err){
      setInprocess(false)
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return (
    <Page>
      <Navbar title={labels.permitUser} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.user}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
          disabled={props.id !== '0'}
        >
          <select name="userId" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value=""></option>
            {users.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={labels.store}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="store" value={storeId} onChange={e => setStoreId(e.target.value)}>
            <option value=""></option>
            {stores.map(s => 
              <option key={s.id} value={s.id}>{s.name}</option>
            )}
          </select>
        </ListItem>
      </List>
      {!userId || !storeId ? '' :
        <Button text={labels.permit} href="#" large onClick={() => handlePermit()} />
      }
    </Page>
  )
}
export default PermitUser
