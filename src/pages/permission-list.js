import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Button, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { permissionSections, orderPositions } from '../data/config'
import { permitUser, showMessage, showError, getMessage } from '../data/actions'

const PermissionList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const customers = useMemo(() => {
    let customers = state.customers.filter(c => (props.id === 's' && c.storeId) || (props.id === 'n' && c.storeName && !c.storeId) || (props.id === 'd' && c.permission_type))
    customers = customers.map(c => {
      const storeName = state.stores.find(s => s.id === c.storeId)?.name || c.storeName || ''
      const permissionTypeName = orderPositions.find(p => p.id === c.permissionType)?.name || ''
      const userInfo = state.users.find(u => u.id === c.id)
      return {
        ...c,
        name: `${c.name}:${userInfo.mobile}`,
        storeName,
        permissionTypeName
      }
    })
    return customers
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
  const handleUnPermit = customer => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        const storeId = props.id === 's' ? '' : customer.storeId
        const position = props.id === 'd' ? '' : customer.permissionType
        await permitUser(customer.id, storeId, position, state.users, state.stores)
        setInprocess(false)
        showMessage(labels.unPermitSuccess)
        props.f7router.back()
      } catch (err){
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })
  }
  return(
    <Page>
      <Navbar title={permissionSections.find(s => s.id === props.id).name} backLink={labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
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
                subtitle={c.storeName}
                text={c.permissionTypeName}
                key={c.id}
              >
                {props.id === 'n' ?
                  <Button text={labels.permitUser} slot="after" onClick={() => props.f7router.navigate(`/permit-user/${c.id}`)} />
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
