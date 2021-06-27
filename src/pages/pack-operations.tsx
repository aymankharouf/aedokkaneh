import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { quantityText } from '../data/actions'
import { StockPack, Store } from '../data/types'

type Props = {
  id: string
}
type ExtendedStockPack = StockPack & {
  storeInfo: Store,
  id: string,
  time: Date
}
const PackOperations = (props: Props) => {
  const { state } = useContext(StateContext)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id)!)
  const [packOperations, setPackOperations] = useState<ExtendedStockPack[]>([])
  useEffect(() => {
    setPackOperations(() => {
      const purchases = state.purchases.filter(p => p.basket.find(p => p.packId === pack.id))
      const packOperations = purchases.map(p => {
        const operationPack = p.basket.find(pa => pa.packId === pack.id)!
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...operationPack,
          id: p.id!,
          time: p.time,
          storeInfo
        }
      })
      return packOperations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.purchases, state.stores, pack])
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packOperations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packOperations.map(t => 
              <ListItem
                title={t.storeInfo.name}
                subtitle={`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}
                footer={moment(t.time).fromNow()}
                after={(t.cost / 100).toFixed(2)}
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

export default PackOperations
