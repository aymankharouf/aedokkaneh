import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem, Toggle } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import { editCustomer, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditCustomer = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [customer] = useState(() => state.customers.find(c => c.id === props.id)!)
  const [userInfo] = useState(() => state.users.find(u => u.id === props.id)!)
  const [name, setName] = useState(userInfo.name)
  const [address, setAddress] = useState(customer.address)
  const [regionId, setRegionId] = useState(userInfo.regionId)
  const [mapPosition, setMapPosition] = useState(customer.mapPosition)
  const [isBlocked, setIsBlocked] = useState(customer.isBlocked)
  const [deliveryFees, setDeliveryFees] = useState((customer.deliveryFees / 100).toFixed(2))
  const [orderLimit, setOrderLimit] = useState((customer.orderLimit / 100).toFixed(2))
  const [specialDiscount, setSpecialDiscount] = useState((customer.specialDiscount / 100).toFixed(2))
  const [hasChanged, setHasChanged] = useState(false)
  const [regions] = useState(() => [...state.regions].sort((l1, l2) => l1.name > l2.name ? 1 : -1))
  useEffect(() => {
    if (name !== userInfo.name
    || address !== customer.address
    || regionId !== userInfo.regionId
    || mapPosition !== customer.mapPosition
    || isBlocked !== customer.isBlocked
    || +deliveryFees * 100 !== customer.deliveryFees
    || +specialDiscount * 100 !== customer.specialDiscount
    || +orderLimit * 100 !== customer.orderLimit) setHasChanged(true)
    else setHasChanged(false)
  }, [customer, userInfo, name, address, regionId, mapPosition, isBlocked, deliveryFees, orderLimit, specialDiscount])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (Number(deliveryFees) < 0 || Number(deliveryFees) !== Number(Number(deliveryFees).toFixed(2))) {
        throw new Error('invalidValue')
      }
      if (Number(orderLimit) < 0 || Number(orderLimit) !== Number(Number(orderLimit).toFixed(2))) {
        throw new Error('invalidValue')
      }
      if (Number(specialDiscount) < 0 || Number(specialDiscount) !== Number(Number(specialDiscount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const newCustomer = {
        ...customer,
        address,
        mapPosition,
        isBlocked,
        deliveryFees: +deliveryFees * 100,
        orderLimit: +orderLimit * 100,
        specialDiscount: +specialDiscount * 100
      }
      editCustomer(newCustomer, name, regionId, userInfo.mobile, customer.storeId, state.stores)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()    
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editCustomer} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          clearButton
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={labels.region}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="regionId" value={regionId} onChange={e => setRegionId(e.target.value)}>
            <option value=""></option>
            {regions.map(r => 
              <option key={r.id} value={r.id}>{r.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="deliveryFees" 
          label={labels.deliveryFees}
          value={deliveryFees}
          clearButton
          type="number" 
          onChange={e => setDeliveryFees(e.target.value)}
          onInputClear={() => setDeliveryFees('')}
        />
        <ListInput 
          name="specialDiscount" 
          label={labels.specialDiscount}
          value={specialDiscount}
          clearButton
          type="number" 
          onChange={e => setSpecialDiscount(e.target.value)}
          onInputClear={() => setSpecialDiscount('')}
        />
        <ListInput 
          name="orderLimit" 
          label={labels.orderLimit}
          value={orderLimit}
          clearButton
          type="number" 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
        <ListInput 
          name="mapPosition" 
          label={labels.mapPosition}
          value={mapPosition}
          clearButton
          type="text" 
          onChange={e => setMapPosition(e.target.value)}
          onInputClear={() => setMapPosition('')}
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={address}
          clearButton
          type="text" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
        <ListItem>
          <span>{labels.isBlocked}</span>
          <Toggle color="red" checked={isBlocked} onToggleChange={() => setIsBlocked(!isBlocked)} />
        </ListItem>
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
      {!name || !regionId || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditCustomer
