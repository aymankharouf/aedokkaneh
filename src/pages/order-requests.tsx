import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { orderStatus, orderRequestTypes } from '../data/config'
import { CustomerInfo, Order } from '../data/types'

type ExtendedOrder = Order & {
  customerInfo: CustomerInfo
} 
const OrderRequests = () => {
  const { state } = useContext(StateContext)
  const [orderRequests, setOrderRequests] = useState<ExtendedOrder[]>([])
  useEffect(() => {
    setOrderRequests(() => {
      const requests = state.orders.filter(r => r.requestType)
      const result = requests.map(r => {
        const customerInfo = state.customers.find(c => c.id === r.userId)!
        return {
          ...r,
          customerInfo
        }
      })
      return result.sort((r1, r2) => (r2.requestTime || new Date()) > (r1.requestTime || new Date()) ? 1 : -1)
    })
  }, [state.orders, state.customers])
  return(
    <Page>
      <Navbar title={labels.orderRequests} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orderRequests.map(r => 
              <ListItem
                link={`/order-request-details/${r.id}`}
                title={r.customerInfo.name}
                subtitle={orderStatus.find(s => s.id === r.status)?.name}
                text={`${labels.type}: ${orderRequestTypes.find(t => t.id === r.requestType)?.name}`}
                footer={moment(r.time).fromNow()}
                after={(r.total / 100).toFixed(2)}
                key={r.id}
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

export default OrderRequests
