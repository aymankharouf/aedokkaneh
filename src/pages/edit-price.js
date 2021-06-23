import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editPrice, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const EditPrice = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  const [store] = useState(() => state.stores.find(s => s.id === props.storeId))
  const [storePack] = useState(() => state.packPrices.find(p => p.packId === props.packId && p.storeId === props.storeId))
  const [cost, setCost] = useState(props.storeId === 's' ? (storePack.cost / 100).toFixed(2) : '')
  const [price, setPrice] = useState('')
  const [offerDays, setOfferDays] = useState('')
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (cost && store.id !== 's') {
      setPrice((cost * (1 + (store.isActive && store.type !== '5' ? 0 : store.discount))).toFixed(2))
    } else {
      setPrice(0)
    }
  }, [cost, store])
  const handleEdit = () => {
    try{
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
      const newStorePack = {
        ...storePack,
        cost: cost * 100,
        price : price * 100,
        offerEnd,
        time: new Date()
      }
      editPrice(newStorePack, storePack.price, state.packPrices, state.packs)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editPrice} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="productName" 
          label={labels.product}
          value={pack.productName}
          type="text" 
          readonly
        />
        <ListInput 
          name="packName" 
          label={labels.pack}
          value={pack.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="oldCost" 
          label={labels.oldCost}
          value={(storePack.cost / 100).toFixed(2)}
          type="text" 
          readonly
        />
        <ListInput 
          name="oldPrice" 
          label={labels.oldPrice}
          value={(storePack.price / 100).toFixed(2)}
          type="text" 
          readonly
        />
        {props.storeId === 's' ? '' : 
          <ListInput 
            name="cost" 
            label={labels.cost}
            clearButton 
            type="number" 
            value={cost}
            onChange={e => setCost(e.target.value)}
            onInputClear={() => setCost('')}
          />
        }
        <ListInput 
          name="price" 
          label={labels.price}
          clearButton 
          type="number" 
          value={price}
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
      </List>
      {!cost || (storePack.isActive && !price) ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPrice
