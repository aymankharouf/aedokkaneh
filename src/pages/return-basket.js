import { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { confirmReturnBasket, showMessage, showError, getMessage, quantityText } from '../data/actions'
import { stockTransTypes } from '../data/config'

const ReturnBasket = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === state.returnBasket.storeId))
  const [basket, setBasket] = useState([])
  const [totalPrice, setTotalPrice] = useState('')
  const [storeId, setStoreId] = useState('')
  const [stores] = useState(() => state.stores.filter(s => s.id !== 's'))
  useEffect(() => {
    setBasket(() => {
      let basket = state.returnBasket?.packs || []
      basket = basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId) || ''
        return {
          ...p,
          packInfo
        }
      })
      return basket.sort((p1, p2) => p1.time - p2.time)
    })
    setTotalPrice(() => state.returnBasket.packs?.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0) || 0)
  }, [state.returnBasket, state.packs])
  useEffect(() => {
    if (!state.returnBasket) f7.views.current.router.navigate('/home/', {reloadAll: true})
  }, [state.returnBasket, props])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      let packs = state.returnBasket.packs.slice()
      packs = packs.map(p => {
        const { weight, ...others } = p
        if (weight) others['weight'] = weight
        return others
      })
      const returnBasket = {
        ...state.returnBasket,
        packs
      }
      confirmReturnBasket(returnBasket, storeId || state.returnBasket.storeId, state.orders, state.stockTrans, state.packPrices, state.packs, state.purchases, state.stores)
      dispatch({type: 'CLEAR_RETURN_BASKET'})
      showMessage(labels.executeSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0  
  return (
    <Page>
      <Navbar title={`${labels.basket} ${stockTransTypes.find(t => t.id === state.returnBasket.type)?.name} ${store?.name || ''}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {basket.map(p => 
            <ListItem
              title={p.packInfo.productName}
              subtitle={p.packInfo.productAlias}
              text={p.packInfo.name}
              footer={`${labels.grossPrice}: ${(Math.round(p.cost * p.quantity) / 100).toFixed(2)}`}
              key={i++}
            >
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</div>
              <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
              {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
              <Link slot="after" iconMaterial="delete" iconColor="red" onClick={()=> dispatch({type: 'REMOVE_FROM_RETURN_BASKET', pack: p})}/>
            </ListItem>
          )}
        </List>
        <List form>
          {state.returnBasket.type === 's' ? 
            <ListItem
              title={labels.store}
              smartSelect
              smartSelectParams={{
                openIn: "popup", 
                closeOnSelect: true, 
                searchbar: true, 
                searchbarPlaceholder: labels.search,
                popupCloseLinkText: labels.close
              }}
            >
              <select name="storeId" value={storeId} onChange={e => setStoreId(e.target.value)}>
                <option value=""></option>
                {stores.map(s => 
                  <option key={s.id} value={s.id}>{s.name}</option>
                )}
              </select>
            </ListItem>
          : ''}
        </List>
      </Block>
      {state.returnBasket.type === 's' && !storeId ? '' :
        <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(totalPrice / 100).toFixed(2)}`} color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => dispatch({type: 'CLEAR_RETURN_BASKET'})} />
      </Toolbar>
    </Page>
  )
}
export default ReturnBasket
