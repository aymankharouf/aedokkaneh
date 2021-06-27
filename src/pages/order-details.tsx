import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton, Badge } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { updateOrderStatus, showMessage, showError, getMessage, quantityDetails, mergeOrder, setDeliveryTime } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import BottomToolbar from './bottom-toolbar'
import { Order, OrderBasketPack } from '../data/types'

type Props = {
  id: string,
  type: string
}
type ExtendedOrderBasketPack = OrderBasketPack & {
  storeName: string,
  priceNote: string,
  statusNote: string
}
type StatusAction = {
  id: string,
  name: string,
  status: string[],
  path: string
}
const OrderDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(() => props.type === 'a' ? state.archivedOrders.find(o => o.id === props.id)! : state.orders.find(o => o.id === props.id)!)
  const [orderBasket, setOrderBasket] = useState<ExtendedOrderBasketPack[]>([])
  const [statusActions, setStatusActions] = useState<StatusAction[]>([])
  const [lastOrder, setLastOrder] = useState<Order>()
  const actionsList = useRef<Actions>(null)
  useEffect(() => {
    setOrder(() => state.orders.find(o => o.id === props.id)!)
  }, [state.orders, props.id])
  useEffect(() => {
    setOrderBasket(() => order.basket.map(p => {
      const storeName = p.storeId ? (p.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === p.storeId)?.name || '') : ''
      const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
      const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
      return {
        ...p,
        storeName,
        priceNote,
        statusNote
      }
    }))
  }, [order, state.stores])
  useEffect(() => {
    setStatusActions(() => {
      const statusActions = [
        {id: 'a', name: 'اعتماد', status: ['n', 's'], path: ''},
        {id: 's', name: 'تعليق', status: ['n', 'a'], path: ''},
        {id: 'r', name: 'رفض', status: ['n', 's'], path: ''},
        {id: 'c', name: 'الغاء', status: ['n', 's', 'a'], path: ''},
        {id: 'i', name: 'استيداع', status: ['f', 'e', 'p'], path: ''},
        {id: 't', name: 'تحديد موعد التسليم', status: ['p'], path: ''},
        {id: 'd', name: 'تسليم', status: ['p'], path: ''},
        {id: 'e', name: 'تعديل', status: ['n', 'a', 'e', 's', 'f'], path: `/edit-order/${order.id}/type/e`},
        {id: 'b', name: 'ارجاع', status: ['p', 'd'], path: `/edit-order/${props.id}/type/r`}
      ]
      return statusActions.filter(a => a.status.find(s => s === order.status))
    })
  }, [order, props.id])
  useEffect(() => {
    setLastOrder(() => {
      const userOrders = state.orders.filter(o => o.id !== order.id && o.userId === order.userId && !['c', 'm', 'r'].includes(o.status))
      userOrders.sort((o1, o2) => o2.time > o1.time ? 1 : -1)
      return ['a', 'e'].includes(userOrders[0]?.status) ? userOrders[0] : undefined
    })
  }, [state.orders, order])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAction = (action: StatusAction) => {
    try{
      if (action.path) {
        f7.views.current.router.navigate(action.path)
      } else {
        if (action.id === 'a' && !state.customers.find(c => c.id === order.userId)){
          throw new Error('notApprovedUser')
        } else if (action.id === 'a' && lastOrder) {
          f7.dialog.confirm(labels.confirmMergeText, labels.confirmationTitle, () => {
            try{
              let found
              for (let p of order.basket) {
                found = lastOrder.basket.find(bp => bp.packId === p.packId)
                if (found && found.price !== p.price) {
                  throw new Error('samePackWithDiffPrice')
                }
                if (found && found.weight > 0 && state.packs.find(pa => pa.id === p.packId)?.isDivided) {
                  throw new Error('samePackPurchasedByWeight')
                }
              }
              mergeOrder(lastOrder, order.basket, order.id!)
              showMessage(labels.mergeSuccess)
              f7.views.current.router.back()
            } catch(err) {
              setError(getMessage(f7.views.current.router.currentRoute.path, err))
            }
          }, () => {
            try{
              updateOrderStatus(order, action.id, state.packPrices, state.packs, false)
              showMessage(labels.editSuccess)
              f7.views.current.router.back()
            } catch(err) {
              setError(getMessage(f7.views.current.router.currentRoute.path, err))
            }
          })
        } else if (action.id === 'i') {
          f7.dialog.confirm(labels.confirmationBlockUser, labels.confirmationTitle, () => {
            try{
              updateOrderStatus(order, action.id, state.packPrices, state.packs, true)
              showMessage(labels.editSuccess)
              f7.views.current.router.back()
            } catch(err) {
              setError(getMessage(f7.views.current.router.currentRoute.path, err))
            }
          }, () => {
            try{
              updateOrderStatus(order, action.id, state.packPrices, state.packs, false)
              showMessage(labels.editSuccess)
              f7.views.current.router.back()
            } catch(err) {
              setError(getMessage(f7.views.current.router.currentRoute.path, err))
            }
          })
        } else if (action.id === 'd') {
          updateOrderStatus(order, 'd', state.packPrices, state.packs, false)
          showMessage(labels.editSuccess)
          f7.views.current.router.back()
        } else if (action.id === 't') {
          f7.dialog.prompt(labels.enterDeliveryTime, labels.deliveryTimeTitle, value => {
            try{
              setDeliveryTime(order.id!, value)
              showMessage(labels.editSuccess)
              f7.views.current.router.back()
            } catch(err) {
              setError(getMessage(f7.views.current.router.currentRoute.path, err))
            }
          })
        } else {
          updateOrderStatus(order, action.id, state.packPrices, state.packs, false)
          showMessage(labels.editSuccess)
          f7.views.current.router.back()
        }  
      }
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.orderDetails} backLink={labels.back} />
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
              <div className="list-subtext1">{p.priceNote}</div>
              <div className="list-subtext2">{quantityDetails(p)}</div>
              <div className="list-subtext3">{p.storeId ? `${labels.storeName}: ${p.storeName}` : ''}</div>
              {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total"
            after={(order.total / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={((order.fixedFees + order.deliveryFees) / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.discount} 
            className="discount" 
            after={((order.discount.value + order.fraction) / 100).toFixed(2)} 
          /> 
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((order.total + order.fixedFees + order.deliveryFees - order.discount.value - order.fraction ) / 100).toFixed(2)} 
          />
          {order.profit ? 
            <ListItem 
              title={labels.profit} 
              after={(order.profit / 100).toFixed(2)} 
            /> 
          : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => actionsList.current?.open()}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/customer-details/${order.userId}`)}>{labels.customerInfo}</ActionsButton>
        {props.type === 'n' && statusActions.map(a => 
          <ActionsButton key={a.id} onClick={() => handleAction(a)}>{a.name}</ActionsButton>
        )}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
