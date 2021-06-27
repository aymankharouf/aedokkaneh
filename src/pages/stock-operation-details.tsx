import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { stockOperationTypes } from '../data/config'
import { Pack, StockPack } from '../data/types'

type Props = {
  id: string,
  type: string
}
type ExtendedStockPack = StockPack & {
  packInfo: Pack
}
const StockOperationDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [stockOperation] = useState(() => props.type === 'a' ? state.archivedStockOperations.find(t => t.id === props.id)! : state.stockOperations.find(t => t.id === props.id)!)
  const [stockOperationBasket, setStockOperationBasket] = useState<ExtendedStockPack[]>([])
  useEffect(() => {
    setStockOperationBasket(() => stockOperation.basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)!
      return {
        ...p,
        packInfo
      }
    }))
  }, [stockOperation, state.packs])
  return(
    <Page>
      <Navbar title={`${stockOperationTypes.find(ty => ty.id === stockOperation.type)?.name} ${stockOperation.storeId ? state.stores.find(s => s.id === stockOperation.storeId)?.name : ''}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockOperationBasket.map(p => 
            <ListItem 
              title={p.packInfo.productName}
              subtitle={p.packInfo.productAlias}
              text={p.packInfo.name}
              footer={`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}
              after={(Math.round(p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}
              key={p.packId}
            >
              <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
              {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            </ListItem>
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default StockOperationDetails
