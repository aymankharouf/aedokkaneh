import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';


const StockTransDetails = props => {
  const { state, user } = useContext(StoreContext)
  const stockTrans = useMemo(() => state.stockTrans.find(t => t.id === props.id)
  , [state.stockTrans, props.id])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.stockTransDetails} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {stockTrans.basket.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem 
                title={productInfo.name}
                after={(parseInt(p.cost * p.quantity) / 1000).toFixed(3)}
                key={p.packId}
              >
                <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                <Badge slot="title" color="red">{p.quantity}</Badge>
                <div className="list-line1">{packInfo.name}</div>
              </ListItem>
            )}
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
