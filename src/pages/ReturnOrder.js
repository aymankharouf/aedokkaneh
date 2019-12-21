import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge, Link } from 'framework7-react'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { quantityText, addQuantity } from '../data/Actions'

const ReturnOrder = props => {
  const { state, user } = useContext(StoreContext)
  const order = useMemo(() => state.orders.find(o => o.id === props.id)
  , [state.orders, props.id])

  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.returnOrder} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {order.basket && order.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
            return (
              <ListItem 
                link={`/returnOrder/${props.id}/pack/${p.packId}`}
                key={p.packId} 
                title={productInfo.name}
                subtitle={packInfo.name}
                text={storeName}
                footer={state.orderPackStatus.find(s => s.id === p.status).name}
                after={(p.gross / 1000).toFixed(3)}
              >
                {addQuantity(p.purchased, -1 * (p.returned ?? 0)) > 0 ? 
                  <Badge slot="title" color="green">
                    {quantityText(addQuantity(p.purchased, -1 * (p.returned ?? 0)), addQuantity(p.weight, -1 * (p.returned ?? 0)))}
                  </Badge> 
                : ''}
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}
export default ReturnOrder
