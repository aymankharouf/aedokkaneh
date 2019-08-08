import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmPurchase, updateOrder, stockIn } from '../data/Actions'


const ConfirmPurchase = props => {
  const { state, user, orders, dispatch } = useContext(StoreContext)
  const store = state.basket.store ? state.stores.find(rec => rec.id === state.basket.store.id) : null
  const totalPrice = state.basket.products ? state.basket.products.reduce((a, product) => a + Number(product.netPrice), 0) : 0
  const handlePurchase = () => {
    const basket = state.basket.products.map(product => {
      return ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        actualPrice: product.actualPrice,
        purchasePrice: product.purchasePrice,
        netPrice: product.netPrice
      })
    })
    const purchase = {
      storeId: state.basket.storeId,
      basket: basket,
      total: parseFloat(totalPrice).toFixed(3),
      time: new Date()
    }
    confirmPurchase(purchase).then(purchaseId => {
      dispatch({type: 'ADD_PURCHASE', purchase: {...purchase, id: purchaseId}})
      const approvedOrders = orders.filter(rec => rec.status === 'a' || rec.status === 'e')
      state.basket.products.forEach(product => {
        let remainingQuantity = product.quantity 
        let inOrders = approvedOrders.filter(order => order.basket.find(rec => rec.id === product.id && rec.price === product.price))
        inOrders.sort((order1, order2) => order1.time - order2.time)
        inOrders.forEach(async order => {
          const orderProduct = order.basket.find(rec => rec.id === product.id)
          const otherProducts = order.basket.filter(rec => rec.id !== product.id)
          let purchasedQuantity
          let orderStatus = 'e'
          if (remainingQuantity > 0){
            if (remainingQuantity >= orderProduct.quantity - orderProduct.purchasedQuantity) {
              purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity
              if (otherProducts.length === otherProducts.filter(rec => rec.quantity === rec.purchasedQuantity).length) {
                orderStatus = 'f'
              }
            } else {
              purchasedQuantity = orderProduct.quantity - orderProduct.purchasedQuantity - remainingQuantity
            }
            const newOrder = {...order, status: orderStatus, basket: [...otherProducts, {...orderProduct, purchasedQuantity: orderProduct.purchasedQuantity + purchasedQuantity}]}
            await updateOrder(newOrder)
            remainingQuantity -=  purchasedQuantity
          }
        })
        if (remainingQuantity > 0) {
          const stock = state.stores.find(rec => rec.storeType === 'i')
          stockIn(product, stock, remainingQuantity)
        }
      })
      props.f7router.navigate('/home/')
      dispatch({type: 'CLEAR_BASKET'})
    })
  }
  if (!user) return <ReLogin callingPage="confirmPurchase"/>
  return(
    <Page>
    <Navbar title={`Purchase from ${store ? store.name: ''}`} backLink="Back" />
    <Block>
        <List>
          {state.basket.products && state.basket.products.map(product => 
            <ListItem 
              key={product.id} 
              title={`${product.name} (${product.quantity})`} 
              after={product.netPrice}
            />
          )}
          <ListItem title="Total" className="total" after={parseFloat(totalPrice).toFixed(3)} />
        </List>
    </Block>
    <Fab position="center-bottom" slot="fixed" text='اعتماد' color="red" onClick={() => handlePurchase()}>
      <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
    </Fab>
    <Toolbar bottom>
      <BottomToolbar/>
    </Toolbar>
  </Page>
  )
}
export default ConfirmPurchase