import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'
import { StockOperation } from '../data/types'

type Props = {
  id: string
}
const StoreOperations = (props: Props) => {
  const { state } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [operations, seOperations] = useState<StockOperation[]>([])
  useEffect(() => {
    seOperations(() => {
      const stockOperations = state.stockOperations.filter(t => t.storeId === props.id && t.type !== 'p')
      const purchases = state.purchases.filter(p => p.storeId === props.id)
      const result = purchases.map(p => {
        return {
          purchaseId: p.id!,
          storeId: p.storeId,
          type: 'p',
          total: p.total,
          time: p.time,
          basket: p.basket
        }
      })
      const operations = [...result, ...stockOperations]
      return operations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockOperations, state.purchases, props.id])

  return(
    <Page>
      <Navbar title={`${labels.operations} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {operations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : operations.map(t => 
              <ListItem
                link={t.type === 'p' ? `/purchase-details/${t.id}/type/n` : `/stock-operation-details/${t.id}/type/n`}
                title={stockOperationTypes.find(tt => tt.id === t.type)?.name}
                subtitle={`${labels.total}: ${(t.total / 100).toFixed(2)}`}
                text={moment(t.time).fromNow()}
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

export default StoreOperations
