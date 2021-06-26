import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actionst'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import { iPack, iStockPack } from '../data/interfaces'

interface Props {
  id: string,
  type: string
}
interface ExtendedStockPack extends iStockPack {
  packInfo: iPack
}
const StockTransDetails = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [stockTrans] = useState(() => props.type === 'a' ? state.archivedStockTrans.find(t => t.id === props.id)! : state.stockTrans.find(t => t.id === props.id)!)
  const [stockTransBasket, setStockTransBasket] = useState<ExtendedStockPack[]>([])
  useEffect(() => {
    setStockTransBasket(() => stockTrans.basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)!
      return {
        ...p,
        packInfo
      }
    }))
  }, [stockTrans, state.packs])
  return(
    <Page>
      <Navbar title={`${stockTransTypes.find(ty => ty.id === stockTrans.type)?.name} ${stockTrans.storeId ? state.stores.find(s => s.id === stockTrans.storeId)?.name : ''}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {stockTransBasket.map(p => 
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
export default StockTransDetails
