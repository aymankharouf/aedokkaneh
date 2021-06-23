import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Button, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { permitUser, showMessage, showError, getMessage } from '../data/actionst'
import { iCustomerInfo } from '../data/interfaces'

interface Props {
  id: string
}
const PermissionList = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [customers, setCustomers] = useState<iCustomerInfo[]>([])
  useEffect(() => {
    setCustomers(() => {
      const customers = state.customers.filter(c => (props.id === 's' && c.storeId) || (props.id === 'n' && c.storeName && !c.storeId))
      return customers.map(c => {
        const storeName = state.stores.find(s => s.id === c.storeId)?.name || c.storeName
        return {
          ...c,
          storeName
        }
      })
    })
  }, [state.customers, state.stores, state.users, props.id])
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
  const handleUnPermit = (customer: iCustomerInfo) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await permitUser(customer.id, null, state.users, state.stores)
        setInprocess(false)
        showMessage(labels.unPermitSuccess)
        f7.views.current.router.back()
      } catch (err){
        setInprocess(false)
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  return(
    <Page>
      <Navbar title={props.id === 's' ? labels.storesOwners : labels.newOwners} backLink={labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/permit-user/0">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {customers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : customers.map(c => 
              <ListItem
                title={c.name}
                subtitle={c.storeName || ''}
                key={c.id}
              >
                {props.id === 'n' ?
                  <Button text={labels.permitUser} slot="after" onClick={() => f7.views.current.router.navigate(`/permit-user/${c.id}`)} />
                : 
                  <Button text={labels.unPermitUser} slot="after" onClick={() => handleUnPermit(c)} />
                }
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PermissionList
