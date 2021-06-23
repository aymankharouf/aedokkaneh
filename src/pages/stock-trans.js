import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'

const StockTrans = props => {
  const { state } = useContext(StoreContext)
  const [stockTrans, setStockTrans] = useState([])
  useEffect(() => {
    setStockTrans(() => {
      const stockTrans = state.stockTrans.map(t => {
        const stockTransTypeInfo = stockTransTypes.find(ty => ty.id === t.type)
        const storeInfo = state.stores.find(s => s.id === t.storeId)
        return {
          ...t,
          stockTransTypeInfo,
          storeInfo
        }
      })
      return stockTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.stockTrans, state.stores])
  return(
    <Page>
      <Navbar title={labels.stockTrans} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-stock-trans/')}>
        <Icon material="backup"></Icon>
      </Fab>

      <Block>
        <List mediaList>
          {stockTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockTrans.map(t => 
              <ListItem
                link={`/stock-trans-details/${t.id}/type/n`}
                title={`${t.stockTransTypeInfo.name} ${t.storeId ? t.storeInfo.name : ''}`}
                subtitle={moment(t.time.toDate()).fromNow()}
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

export default StockTrans
