import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import { getArchivedStockTrans, getMessage, showError } from '../data/actionst'
import { iStockTrans, iStore } from '../data/interfaces'

interface ExtendedStockTrans extends iStockTrans {
  storeInfo: iStore
}
const ArchivedStockTrans = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [stockTrans, setStockTrans] = useState<ExtendedStockTrans[]>([])
  const [monthlyTrans] = useState(() => [...state.monthlyTrans.sort((t1, t2) => t2.id - t1.id)])
  const lastMonth = useRef(0)
  useEffect(() => {
    setStockTrans(() => {
      const stockTrans = state.stockTrans.map(t => {
        const storeInfo = state.stores.find(s => s.id === t.storeId)!
        return {
          ...t,
          storeInfo
        }
      })
      return stockTrans.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockTrans, state.stores])
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
      const trans = getArchivedStockTrans(id)
      if (trans.length > 0) {
        dispatch({type: 'ADD_ARCHIVED_STOCK_TRANS', payload: trans})
      }
      lastMonth.current++
  } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  return(
    <Page>
      <Navbar title={labels.archivedStockTrans} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockTrans.map(t => 
              <ListItem
                link={`/stock-trans-details/${t.id}/type/a`}
                title={`${stockTransTypes.find(tt => tt.id === t.type)?.name} ${t.storeId ? t.storeInfo.name : ''}`}
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

export default ArchivedStockTrans
