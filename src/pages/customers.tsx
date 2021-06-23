import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Link, Searchbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { iCustomerInfo } from '../data/interfaces'

const Customers = () => {
  const { state } = useContext(StoreContext)
  const [customers, setCustomers] = useState<iCustomerInfo[]>([])
  useEffect(() => {
    setCustomers(() => [...state.customers].sort((c1, c2) => c2.time > c1.time ? 1 : -1))
  }, [state.customers])

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.customers} backLink={labels.back}>
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
          {customers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : customers.map(c => 
              <ListItem
                link={`/customer-details/${c.id}`}
                title={c.name}
                subtitle={moment(c.time).fromNow()}
                badge={c.isBlocked ? labels.isBlocked : ''}
                badgeColor="red"
                key={c.id}
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

export default Customers
