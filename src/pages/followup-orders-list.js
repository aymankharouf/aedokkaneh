import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus, orderPositions } from '../data/config'

const FollowupOrdersList = props => {
  const { state } = useContext(StoreContext)
  const orders = useMemo(() => {
    let orders = state.orders.filter(o => o.position === props.id)
    orders = orders.map(o => {
      const userInfo = state.users.find(u => u.id === o.userId)
      const orderStatusInfo = orderStatus.find(s => s.id === o.status)
      return {
        ...o,
        userInfo,
        orderStatusInfo
      }
    })
    return orders
  }, [state.orders, state.users, props.id])
  return(
    <Page>
      <Navbar title={`${labels.followupOrders} ${orderPositions.find(p => p.id === props.id).name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o => 
              <ListItem
                link={`/followup-order-details/${o.id}`}
                title={`${labels.user}: ${o.userInfo.name}`}
                subtitle={`${labels.mobile}: ${o.userInfo.mobile}`}
                text={`${labels.status}: ${o.orderStatusInfo.name}`}
                footer={o.statusTime ? moment(o.statusTime.toDate()).fromNow() : ''}
                after={(o.total / 1000).toFixed(3)}
                key={o.id}
              >
                {o.withDelivery ? <div className="list-subtext1">{labels.withDeliveryNote}</div> : ''}
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

export default FollowupOrdersList
