import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import PackImage from './pack-image'
import { showMessage, showError, getMessage, quantityText } from '../data/actions'


const PurchaseDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [purchase, setPurchase] = useState('')
  const [purchaseBasket, setPurchaseBasket] = useState([])
  useEffect(() => {
    setPurchase(() => props.type === 'a' ? state.archivedPurchases.find(p => p.id === props.id) : state.purchases.find(p => p.id === props.id))
  }, [state.purchases, state.archivedPurchases, props.id, props.type])
  useEffect(() => {
    setPurchaseBasket(() => {
      const purchaseBasket =  purchase ? purchase.basket.filter(p => !state.returnBasket?.packs?.find(bp => bp.packId === p.packId)) : []
      return purchaseBasket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
        return {
          ...p,
          packInfo,
          weightText
        }
      })
    })
  }, [state.packs, state.returnBasket, purchase])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleReturn = pack => {
    try{
      const affectedOrders = state.orders.filter(o => o.basket.find(p => p.packId === pack.packId && p.lastPurchaseId === purchase.id) && ['p', 'f'].includes(o.status))
      if (affectedOrders.length > 0) {
        throw new Error('finishedOrdersAffected')
      }
      if (state.returnBasket && state.returnBasket.purchase !== purchase) {
        throw new Error('diffPurchaseInReturnBasket')
      }
      const params = {
        type: 'r',
        packId: pack.packId,
        cost: pack.cost,
        price: pack.price,
        quantity: pack.quantity,
        storeId: purchase.storeId,
        purchaseId: purchase.id
      }
      dispatch({type: 'ADD_TO_RETURN_BASKET', params})
      showMessage(labels.addToBasketSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.purchaseDetails} backLink={labels.back} />
      <Block>
        <List mediaList>
          {purchaseBasket.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchaseBasket.map(p => 
            <ListItem 
              title={p.packInfo.productName}
              subtitle={p.packInfo.name}
              text={`${labels.unitPrice}: ${(p.cost / 1000).toFixed(3)}`}
              footer={`${labels.price}: ${(Math.trunc(p.cost * (p.weight || p.quantity)) / 1000).toFixed(3)}`}
              key={p.packId} 
            >
              <PackImage slot="media" pack={p.packInfo} type="list" />
              <div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)} ${p.weightText}`}</div>
              {props.type === 'n' ? <Button text={labels.return} slot="after" onClick={() => handleReturn(p)} /> : ''}
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
export default PurchaseDetails
