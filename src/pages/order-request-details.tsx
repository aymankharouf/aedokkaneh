import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'
import { showMessage, showError, getMessage, quantityDetails, approveOrderRequest, addQuantity } from '../data/actionst'
import labels from '../data/labels'
import { orderPackStatus, orderRequestTypes, setup } from '../data/config'
import BottomToolbar from './bottom-toolbar'

interface Props {
  id: string
}
const OrderRequestDetails = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [order] = useState(() => state.orders.find(o => o.id === props.id)!)
  const [orderBasket] = useState(() => {
    const basket = order.basket.slice()
    const result = basket.map(p => {
      return {
        ...p,
        change: 0
      }
    })
    order.requestBasket.forEach(p => {
      const index = result.findIndex(bp => bp.packId === p.packId)
      if (index === -1) {
        result.push({
          ...p,
          change: p.quantity
        })
      } else {
        result.splice(index, 1, {
          ...result[index],
          quantity: p.quantity,
          change: addQuantity(p.quantity, -1 * result[index].quantity)
        })
      }
    })
    return result.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId)?.name) : ''
      const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
      const changeQuantityNote = p.change === 0 ? '' : p.change > 0 ? `${labels.increase} ${p.change}` : `${labels.decrease} ${-1 * p.change}`
      return {
        ...p,
        storeName,
        statusNote,
        changeQuantityNote,
      }
    })
  })
  const [total] = useState(() => orderBasket.reduce((sum, p) => sum + p.price * p.quantity, 0))
  const [fixedFees] = useState(() => Math.round(setup.fixedFees * total))
  const [fraction] = useState(() => (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = () => {
    try{
      approveOrderRequest(order, state.orders, state.packPrices, state.packs)
      showMessage(labels.approveSuccess)
      f7.views.current.router.back()
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return(
    <Page>
      <Navbar title={`${labels.request} ${orderRequestTypes.find(t => t.id === order.requestType)?.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              key={p.packId} 
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.status}: ${p.statusNote}`}
              after={(p.gross / 100).toFixed(2)}
            >
              <div className="list-subtext1">{quantityDetails(p)}</div>
              {p.changeQuantityNote ? <div className="list-subtext2">{`${labels.requestedChange}: ${p.changeQuantityNote}`}</div> : ''}
              <div className="list-subtext3">{p.storeName ? `${labels.storeName}: ${p.storeName}` : ''}</div>
              {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total"
            after={(total / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={((fixedFees + order.deliveryFees) / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.discount} 
            className="discount" 
            after={((order.discount.value + fraction) / 100).toFixed(2)} 
          /> 
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((total + fixedFees + order.deliveryFees - order.discount.value - fraction) / 100).toFixed(2)} 
          />
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderRequestDetails
