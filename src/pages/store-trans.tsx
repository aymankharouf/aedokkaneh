import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'
import { iStockTrans } from '../data/interfaces'

interface Props {
  id: string
}
const StoreTrans = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [trans, setTrans] = useState<iStockTrans[]>([])
  useEffect(() => {
    setTrans(() => {
      const stockTrans = state.stockTrans.filter(t => t.storeId === props.id && t.type !== 'p')
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
      const trans = [...result, ...stockTrans]
      return trans.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockTrans, state.purchases, props.id])

  return(
    <Page>
      <Navbar title={`${labels.trans} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {trans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trans.map(t => 
              <ListItem
                link={t.type === 'p' ? `/purchase-details/${t.id}/type/n` : `/stock-trans-details/${t.id}/type/n`}
                title={stockTransTypes.find(tt => tt.id === t.type)?.name}
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

export default StoreTrans
