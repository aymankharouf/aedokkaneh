import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, Toolbar, List, ListItem, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { randomColors, orderStatus } from '../data/config'

type OrderStatus = {
  id: string,
  name: string,
  count: number
}
const Orders = () => {
  const { state } = useContext(StateContext)
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([])
  const [orderRequests, setOrderRequests] = useState(0)
  const [finishedOrders, setFinishedOrders] = useState(0)
  useEffect(() => {
    setOrderStatuses(() => orderStatus.map(s => {
      const orders = state.orders.filter(o => o.status === s.id).length
      return {
        ...s,
        count: orders
      }
    }))
    setOrderRequests(() => state.orders.filter(o => o.requestType).length)
    setFinishedOrders(() => state.orders.filter(o => o.status === 'f').length)
  }, [state.orders])
  let i = 0
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.orders} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-orders/')}>
        <Icon material="backup"></Icon>
      </Fab>
      <Block>
				<List>
          <ListItem 
            link="/order-requests/" 
            title={labels.orderRequests} 
            badge={orderRequests} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          <ListItem 
            link="/prepare-orders/" 
            title={labels.prepareOrders} 
            badge={finishedOrders} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          {orderStatuses.map(s => 
            <ListItem 
              link={`/orders-list/${s.id}/type/s`} 
              title={s.name} 
              badge={s.count} 
              badgeColor={randomColors[i++ % 10].name} 
              key={s.id}
            />
          )}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Orders
