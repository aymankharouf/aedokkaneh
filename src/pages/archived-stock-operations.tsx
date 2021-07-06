import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { getArchivedStockOperations, getMessage, showError } from '../data/actions'
import { StockOperation, Store } from '../data/types'

type ExtendedStockOperation = StockOperation & {
  storeInfo: Store
}
const ArchivedStockOperations = () => {
  const { state, dispatch } = useContext(StateContext)
  const [error, setError] = useState('')
  const [stockOperations, setStockOperations] = useState<ExtendedStockOperation[]>([])
  const [monthlyOperations] = useState(() => [...state.monthlyOperations.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setStockOperations(() => {
      const stockOperations = state.stockOperations.map(t => {
        const storeInfo = state.stores.find(s => s.id === t.storeId)!
        return {
          ...t,
          storeInfo
        }
      })
      return stockOperations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockOperations, state.stores])
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
      const operations = getArchivedStockOperations(id)
      if (operations.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_STOCK_OPERATIONS', payload: operations})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return(
    <Page>
      <Navbar title={labels.archivedStockOperations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockOperations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockOperations.map(t => 
              <ListItem
                link={`/stock-operation-details/${t.id}/a`}
                title={`${stockOperationTypes.find(tt => tt.id === t.type)?.name} ${t.storeId ? t.storeInfo.name : ''}`}
                subtitle={moment(t.time).fromNow()}
                after={(t.total / 100).toFixed(2)}
                key={t.id}
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

export default ArchivedStockOperations
