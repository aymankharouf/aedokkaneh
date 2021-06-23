import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actions'
import labels from '../data/labels'

const PrepareOrdersList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  useEffect(() => {
    setOrders(() => {
      let orders = state.orders.filter(o => o.id === props.orderId || (props.orderId === '0' && o.status === 'f' && o.basket.find(p => p.packId === props.packId && !p.isAllocated)))
      orders = orders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)
        const basketInfo = o.basket.find(p => p.packId === props.packId)
        return {
          ...o,
          customerInfo,
          basketInfo
        }
      })
      return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
    })
  }, [state.orders, state.customers, props.orderId, props.packId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAllocate = order => {
    try{
      allocateOrderPack(order, pack)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                title={o.customerInfo.name}
                subtitle={`${labels.quantity}: ${o.basketInfo.weight || o.basketInfo.quantity}`}
                key={o.id}
              >
                <Button text={labels.allocate} slot="after" onClick={() => handleAllocate(o)} />
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

export default PrepareOrdersList
