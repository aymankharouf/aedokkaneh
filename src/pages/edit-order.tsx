import { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper } from 'framework7-react'
import { StoreContext } from '../data/store'
import { updateOrderStatus, editOrder, showMessage, showError, getMessage, quantityDetails, returnOrder } from '../data/actionst'
import labels from '../data/labels'
import { iOrderBasketPack, iPack } from '../data/interfaces'

interface Props {
  id: string,
  type: string
}
interface ExtendedOrderBasketPack extends iOrderBasketPack {
  packInfo: iPack
}
const EditOrder = (props: Props) => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [order] = useState(() => state.orders.find(o => o.id === props.id)!)
  const [orderBasket, setOrderBasket] = useState<ExtendedOrderBasketPack[]>([])
  const [total, setTotal] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    const basket = order.basket.map(p => {
      return {
        ...p,
        quantity: props.type === 'e' ? p.quantity : p.purchased,
        oldQuantity: props.type === 'e' ? p.quantity : p.purchased
      }
    })
    dispatch({type: 'LOAD_ORDER_BASKET', payload: basket})
  }, [dispatch, order, props.type])
  useEffect(() => {
    setOrderBasket(() => {
      const orderBasket = state.orderBasket?.filter(p => p.quantity > 0) || []
      return orderBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
    })
  }, [state.orderBasket, state.packs])
  useEffect(() => {
    setHasChanged(() => state.orderBasket?.find(p => p.oldQuantity !== p.quantity) ? true : false)
  }, [state.orderBasket])
  useEffect(() => {
    setTotal(() => orderBasket.reduce((sum, p) => sum + p.gross, 0))
  }, [orderBasket])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        const type = ['f', 'p', 'e'].includes(order.status) ? 'i' : 'c'
        updateOrderStatus(order, type, state.packPrices, state.packs, false)
        showMessage(labels.deleteSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }
  const handleSubmit = () => {
    try{
      if (props.type === 'e') {
        editOrder(order, state.orderBasket!, state.packPrices, state.packs)
      } else {
        const userLocation = state.users.find(c => c.id === order.userId)?.locationId
        const locationFees = state.locations.find(l => l.id === userLocation)?.fees || 0
        returnOrder(order, state.orderBasket!, locationFees, state.packPrices, state.packs)
      }
      showMessage(labels.editSuccess)
      dispatch({type: 'CLEAR_ORDER_BASKET'})
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleIncrease = (pack: ExtendedOrderBasketPack) => {
    if (props.type === 'e' || (props.type === 'r' && pack.quantity < pack.oldQuantity)) {
      dispatch({type: 'INCREASE_ORDER_QUANTITY', payload: pack})
    }
  }
  const handleDecrease = (pack: ExtendedOrderBasketPack) => {
    const params = {
      type: props.type,
      pack
    }
    dispatch({type: 'DECREASE_ORDER_QUANTITY', payload: params})
  }
  return (
    <Page>
      <Navbar title={props.type === 'e' ? labels.editOrder : labels.returnOrder} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.length === 0 ? 
            <ListItem title={labels.noData} />
          :orderBasket.map(p =>
            <ListItem
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.grossPrice}: ${(p.gross / 100).toFixed(2)}`}
              key={p.packId}
            >
              <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
              <div className="list-subtext1">{`${labels.unitPrice}: ${((p.actual || p.price) / 100).toFixed(2)}`}</div>
              <div className="list-subtext2">{quantityDetails(p)}</div>
              <Stepper
                slot="after"
                fill
                buttonsOnly
                onStepperPlusClick={() => handleIncrease(p)}
                onStepperMinusClick={() => handleDecrease(p)}
              />
            </ListItem>
          )}
        </List>
      </Block>
      {hasChanged ? 
        <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(total / 100).toFixed(2)}`} color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      : ''}
      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        {props.type === 'n' ?
          <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
        : ''}
      </Toolbar>
    </Page>
  )
}
export default EditOrder
