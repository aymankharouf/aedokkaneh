import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, Toolbar, List, ListItem, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors, orderStatus } from '../data/config'


const Orders = props => {
  const { state, user } = useContext(StoreContext)
  const [orderStatuses, setOrderStatuses] = useState([])
  const [orderRequests, setOrderRequests] = useState([])
  const [finishedOrders, setFinishedOrders] = useState([])
  useEffect(() => {
    setOrderStatuses(() => orderStatus.map(s => {
      const orders = state.orders.filter(o => o.status === s.id)
      return {
        ...s,
        orders
      }
    }))
    setOrderRequests(() => state.orders.filter(o => o.requestType))
    setFinishedOrders(() => state.orders.filter(o => o.status === 'f'))
  }, [state.orders])
  let i = 0
  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
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
            badge={orderRequests.length} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          <ListItem 
            link="/prepare-orders/" 
            title={labels.prepareOrders} 
            badge={finishedOrders.length} 
            badgeColor={randomColors[i++ % 10].name} 
          />
          {orderStatuses.map(s => 
            <ListItem 
              link={`/orders-list/${s.id}/type/s`} 
              title={s.name} 
              badge={s.orders.length} 
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
