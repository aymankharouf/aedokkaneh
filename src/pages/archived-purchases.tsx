import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Searchbar, Link, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { getArchivedPurchases, getMessage, showError } from '../data/actions'
import { Purchase, Store } from '../data/types'

type ExtendedPurchase = Purchase & {
  storeInfo: Store
}
const ArchivedPurchases = () => {
  const { state, dispatch } = useContext(StateContext)
  const [error, setError] = useState('')
  const [purchases, setPurchases] = useState<ExtendedPurchase[]>([])
  const [monthlyOperations] = useState(() => [...state.monthlyOperations.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.archivedPurchases.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time > p1.time ? 1 : -1)
    })
  }, [state.archivedPurchases, state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRetreive = () => {
    try{
      const id = monthlyOperations[lastMonth.current]?.id
      if (!id) {
        throw new Error('noMoreArchive')
      }
      const purchases = getArchivedPurchases(id)
      if (purchases.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_PURCHASES', payload: purchases})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return(
    <Page>
      <Navbar title={labels.archivedPurchases} backLink={labels.back}>
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
        {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map(p => 
              <ListItem
                link={`/purchase-details/${p.id}/a`}
                title={p.storeInfo.name}
                subtitle={moment(p.time).fromNow()}
                after={(p.total / 100).toFixed(2)}
                key={p.id}
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

export default ArchivedPurchases
