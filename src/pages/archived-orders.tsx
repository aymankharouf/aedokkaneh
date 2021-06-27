import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { getArchivedOrders, getMessage, showError } from '../data/actionst'
import { iCustomerInfo, iOrder } from '../data/interfaces'

interface ExtendedOrder extends iOrder {
  customerInfo: iCustomerInfo
}
const ArchivedOrders = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<ExtendedOrder[]>([])
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setOrders(() => {
      const orders = state.archivedOrders.map(o => {
        const customerInfo = state.customers.find(c => c.id === o.userId)!
        return {
          ...o,
          customerInfo
        }
      })
      return orders.sort((o1, o2) => o2.time > o1.time ? 1 : -1)  
    })
  }, [state.archivedOrders, state.customers])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRetreive = () => {
    try{
      const id = monthlyTrans[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const orders = getArchivedOrders(id)
      if (orders.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_ORDERS', payload: orders})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return(
    <Page>
      <Navbar title={labels.archivedOrders} backLink={labels.back}>
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
                link={`/order-details/${o.id}/type/a`}
                title={o.customerInfo.name}
                subtitle={orderStatus.find(s => s.id === o.status)?.name}
                text={moment(o.time).fromNow()}
                key={o.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleRetreive()}>
        <Icon material="cached"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ArchivedOrders
