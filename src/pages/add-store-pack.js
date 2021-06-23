import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { addPackPrice, showMessage, showError, getMessage } from '../data/actions'

const AddStorePack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [packId, setPackId] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [isActive, setIsActive] = useState(store.isActive)
  const [packs] = useState(() => {
    const packs = state.packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName}-${p.productAlias} ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (cost) {
      setPrice((cost * (1 + (store.isActive && store.type !== '5' ? 0 : store.discount))).toFixed(2))
    } else {
      setPrice(0)
    }
  }, [cost, store])
  const handleSubmit = () => {
    try{
      if (state.packPrices.find(p => p.packId === packId && p.storeId === store.id)) {
        throw new Error('duplicatePackInStore')
      }
      if (Number(cost) <= 0 || Number(cost) !== Number(Number(cost).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      if (Number(price) < Number(cost)) {
        throw new Error('invalidPrice')
      }
      if (offerDays && Number(offerDays) <= 0) {
        throw new Error('invalidPeriod')
      }
      let offerEnd = ''
      if (offerDays) {
        offerEnd = new Date()
        offerEnd.setDate(offerEnd.getDate() + Number(offerDays))
      }
      const storePack = {
        packId,
        storeId: store.id,
        cost: cost * 100,
        price: price * 100,
        offerEnd,
        isActive,
        time: new Date()
      }
      addPackPrice(storePack, state.packPrices, state.packs)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }

  return (
    <Page>
      <Navbar title={`${labels.addProduct} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.product}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="packId" value={packId} onChange={e => setPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="cost" 
          label={labels.cost}
          value={cost}
          clearButton
          type="number" 
          onChange={e => setCost(e.target.value)}
          onInputClear={() => setCost('')}
        />
        <ListInput 
          name="price" 
          label={labels.price}
          value={price}
          clearButton
          type="number" 
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
        />
        <ListInput 
          name="offerDays" 
          label={labels.offerDays}
          value={offerDays}
          clearButton 
          type="number" 
          onChange={e => setOfferDays(e.target.value)}
          onInputClear={() => setOfferDays('')}
        />
        <ListItem>
          <span>{labels.isActive}</span>
          <Toggle 
            name="isActive" 
            color="green" 
            checked={isActive}
            onToggleChange={() => setIsActive(!isActive)}
          />
        </ListItem>
      </List>
      {!packId || !cost ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      
    </Page>
  )
}
export default AddStorePack
