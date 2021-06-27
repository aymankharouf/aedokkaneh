import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { CustomerInfo, Order, UserInfo } from '../data/types'

type Props = {
  id: string,
  type: string
}
type ExtendedOrder = Order & {
  userInfo: UserInfo,
  customerInfo: CustomerInfo
}
const OrdersList = (props: Props) => {
  const { state } = useContext(StateContext)
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  useEffect(() => {
    setOrders(() => {
      const orders = state.orders.filter(o => (props.type === 's' && o.status === props.id) || (props.type === 'u' && o.userId === props.id))
      const result = orders.map(o => {
        const userInfo = state.users.find(u => u.id === o.userId)!
        const customerInfo = state.customers.find(c => c.id === o.userId)!
        return {
          ...o,
          userInfo,
          customerInfo,
        }
      })
      return result.sort((o1, o2) => o2.time > o1.time ? 1 : -1)
    })
  }, [state.orders, state.users, state.customers, props.id, props.type])

  return(
    <Page>
      <Navbar title={`${labels.orders} ${props.type === 's' ? orderStatus.find(s => s.id === props.id)?.name : state.customers.find(c => c.id === props.id)?.name}`} backLink={labels.back}>
      <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                link={`/order-details/${o.id}/type/n`}
                title={props.type === 's' ? (o.customerInfo?.name || o.userInfo.name) : orderStatus.find(s => s.id === o.status)?.name}
                subtitle={o.deliveryTime}
                text={moment(o.time).fromNow()}
                footer={o.lastUpdate ? moment(o.lastUpdate).fromNow() : ''}
                after={(o.total / 100).toFixed(2)}
                key={o.id}
              />
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

export default OrdersList
