import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actionst'
import labels from '../data/labels'
import { iCustomerInfo, iOrder, iOrderBasketPack } from '../data/interfaces'

interface Props {
  packId: string,
  orderId: string
}
interface ExtendedOrder extends iOrder {
  customerInfo: iCustomerInfo,
  basketInfo: iOrderBasketPack
}
const PrepareOrdersList = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId)!)
  useEffect(() => {
    setOrders(() => {
      const orders = state.orders.filter(o => o.id === props.orderId || (props.orderId === '0' && o.status === 'f' && o.basket.find(p => p.packId === props.packId && !p.isAllocated)))
      const result = orders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)!
        const basketInfo = o.basket.find(p => p.packId === props.packId)!
        return {
          ...o,
          customerInfo,
          basketInfo
        }
      })
      return result.sort((o1, o2) => o2.time > o1.time ? 1 : -1)
    })
  }, [state.orders, state.customers, props.orderId, props.packId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAllocate = (order: ExtendedOrder) => {
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
