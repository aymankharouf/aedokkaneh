import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, Icon, Fab, Toolbar, ListInput, BlockTitle } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import { approveAlarm, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'
import { Pack, PackPrice, Store } from '../data/types'

type Props = {
  id: string,
  userId: string
}
type ExtendedPackPrice = PackPrice & {
  storeInfo: Store
}
const AlarmDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [newPackId, setNewPackId] = useState('')
  const [userInfo] = useState(() => state.users.find(u => u.id === props.userId))
  const [customerInfo] = useState(() => state.customers.find(c => c.id === props.userId)!)
  const [alarm] = useState(() => state.alarms.find(a => a.id === props.id)!)
  const [pack] = useState(() => state.packs.find(p => p.id === alarm.packId)!)
  const [storeName] = useState(() => state.stores.find(s => s.id === customerInfo.storeId)?.name)
  const [prices, setPrices] = useState<ExtendedPackPrice[]>([])
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.id !== pack.id)
    let result: Pack[] = []
    if (alarm.type === 'go') {
      result = packs.filter(p => p.productId === pack.productId && p.isOffer)
    } else if (alarm.type === 'eo') {
      result = packs.filter(p => p.productId === pack.productId && p.isOffer && p.closeExpired)
    }
    const output = result.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name}`
      }
    })
    return output.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  })
  useEffect(() => {
    setPrices(() => {
      const prices = state.packPrices.filter(p => p.storeId !== customerInfo.storeId && p.packId === (newPackId || pack.id))
      const result = prices.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return result.sort((p1, p2) => p1.price - p2.price)
    })
  }, [state.packPrices, state.stores, customerInfo, pack, newPackId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = () => {
    try{
      approveAlarm(alarm, state.alarms, newPackId, customerInfo, state.packPrices, state.packs)
      showMessage(labels.approveSuccess)
			f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return (
    <Page>
      <Navbar title={alarmTypes.find(t => t.id === alarm.type)?.name} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <List form inlineLabels>
        <ListInput 
          name="userName" 
          label={labels.user}
          value={customerInfo.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="productName" 
          label={labels.product}
          value={pack.productName}
          type="text" 
          readonly
        />
        <ListInput 
          name="packName" 
          label={labels.pack}
          value={pack.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="currentPrice" 
          label={labels.currentPrice}
          value={(pack.price / 100).toFixed(2)}
          type="number" 
          readonly
        />
        {alarm.type === 'aa' ? 
          <ListInput 
            name="alternative" 
            label={labels.alternative}
            value={alarm.alternative}
            type="text" 
            readonly
          />
        : ''}
        <ListInput 
          name="newPrice"
          label={labels.price}
          value={(alarm.price / 100).toFixed(2)}
          type="number" 
          readonly
        />
        {['eo', 'go'].includes(alarm.type) ? 
          <ListInput 
            name="quantity"
            label={labels.quantity}
            value={alarm.quantity}
            type="number" 
            readonly
          />
        : ''}
        <ListInput 
          name="offerDays"
          label={labels.offerDays}
          value={alarm.offerDays}
          type="number" 
          readonly
        />
        <ListInput 
          name="storeName" 
          label={labels.storeName}
          value={storeName}
          type="text" 
          readonly
        />
        {['aa', 'eo', 'go'].includes(alarm.type) ?
          <ListItem
            title={labels.newProduct}
            smartSelect
            smartSelectParams={{
              openIn: "popup", 
              closeOnSelect: true, 
              searchbar: true, 
              searchbarPlaceholder: labels.search,
              popupCloseLinkText: labels.close
            }}
          >
            <select name="newPackId" value={newPackId} onChange={e => setNewPackId(e.target.value)}>
              <option value=""></option>
              {packs.map(p => 
                <option key={p.id} value={p.id}>{p.name}</option>
              )}
            </select>
          </ListItem>
        : ''}
      </List>
      <BlockTitle>
        {labels.prices}
      </BlockTitle>
        <List mediaList>
        {prices.map(p => 
          <ListItem 
            title={p.storeInfo.name}
            subtitle={p.quantity ? `${labels.quantity}: ${p.quantity}` : ''}
            text={moment(p.time).fromNow()} 
            after={(p.price / 100).toFixed(2)} 
            key={i++} 
          />
        )}
      </List>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default AlarmDetails
