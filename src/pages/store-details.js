import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle, FabButton, FabButtons, FabBackdrop } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const StoreDetails = props => {
  const { state } = useContext(StoreContext)
  const [store, setStore] = useState(() => state.stores.find(s => s.id === props.id))
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === props.id))
  }, [state.stores, props.id])

  return (
    <Page>
      <Navbar title={labels.storeDetails} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={store.name}
          type="text" 
          readonly
        />
        <ListInput
          name="balance"
          label={labels.balance}
          value={((store.balances?.reduce((sum, b) => sum + b.balance, 0) || 0) / 100).toFixed(2)}
          type="number"
          readonly
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={store.mobile}
          type="number"
          readonly
        />
        <ListInput
          name="type"
          label={labels.type}
          value={storeTypes.find(t => t.id === store.type).name}
          type="text"
          readonly
        />
        <ListInput
          name="discount"
          label={labels.discount}
          value={store.discount * 100}
          type="number"
          readonly
        />
        <ListItem>
          <span>{labels.allowReturn}</span>
          <Toggle 
            name="allowReturn" 
            color="green" 
            checked={store.allowReturn} 
            disabled
          />
        </ListItem>
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={store.isActive} 
            disabled
          />
        </ListItem>
        <ListInput
          name="openTime"
          label={labels.openTime}
          value={store.openTime}
          type="text"
          readonly
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={store.address}
          type="text"
        />
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/store-packs/${props.id}`)}>
            <Icon material="shopping_cart"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/edit-store/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => f7.views.current.router.navigate(`/store-trans/${store.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => f7.views.current.router.navigate(`/store-owners/${store.id}`)}>
            <Icon material="perm_identity"></Icon>
          </FabButton>
          <FabButton color="orange" onClick={() => f7.views.current.router.navigate(`/store-balance/${store.id}`)}>
            <Icon material="attach_money"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StoreDetails
