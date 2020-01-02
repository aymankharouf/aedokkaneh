import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { allocateOrderPack, showMessage, getMessage, showError } from '../data/actions'
import labels from '../data/labels'

const PrepareOrdersList = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const orders = useMemo(() => {
    let orders = state.orders.filter(o => props.orderId === '0' ? (o.status === 'f' && o.basket.find(p => p.packId === props.packId && !p.isAllocated)) : o.id === props.orderId)
    orders = orders.map(o => {
      const userInfo = state.users.find(u => u.id === o.userId)
      return {
        ...o,
        userInfo
      }
    })
    return orders.sort((o1, o2) => o2.time.seconds - o1.time.seconds)
  }, [state.orders, state.users, props.orderId, props.packId])
  const pack = useMemo(() => state.packs.find(p => p.id === props.packId)
  , [state.packs, props.packId])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAllocate = async order => {
    try{
      await allocateOrderPack(order, pack)
      showMessage(labels.editSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                title={`${labels.user}: ${o.userInfo.name}`}
                subtitle={`${labels.mobile}: ${o.userInfo.mobile}`}
                text={`${labels.quantity}: ${o.basket.find(p => p.packId === props.packId).quantity}`}
                key={o.id}
              >
                <Button slot="after" onClick={() => handleAllocate(o)}>{labels.allocate}</Button>
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
