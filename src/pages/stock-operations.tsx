import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { StockOperation, Store } from '../data/types'

type ExtendedStockOperation = StockOperation & {
  storeInfo: Store
}
const StockOperations = () => {
  const { state } = useContext(StateContext)
  const [stockOperations, setStockOperations] = useState<ExtendedStockOperation[]>([])
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
  return(
    <Page>
      <Navbar title={labels.stockOperations} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-stock-operations/')}>
        <Icon material="backup"></Icon>
      </Fab>

      <Block>
        <List mediaList>
          {stockOperations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockOperations.map(t => 
              <ListItem
                link={`/stock-operation-details/${t.id}/type/n`}
                title={`${stockOperationTypes.find(tt => tt.id === t.type)?.name} ${t.storeId ? t.storeInfo.name : ''}`}
                subtitle={moment(t.time).fromNow()}
                after={(t.total / 100).toFixed(2)}
                key={t.id}
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

export default StockOperations
