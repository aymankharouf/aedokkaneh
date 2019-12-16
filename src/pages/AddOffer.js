import React, { useState, useContext, useEffect, useMemo } from 'react'
import { addPack, showMessage, showError, getMessage } from '../data/Actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle } from 'framework7-react';
import { StoreContext } from '../data/Store'
import ReLogin from './ReLogin'

const AddOffer = props => {
  const { state, user } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [orderLimit, setOrderLimit] = useState('')
  const [offerPackId, setOfferPackId] = useState('')
  const [offerQuantity, setOfferQuantity] = useState('')
  const [offerPercent, setOfferPercent] = useState('')
  const [bonusPackId, setBonusPackId] = useState('')
  const [bonusQuantity, setBonusQuantity] = useState('')
  const [bonusPercent, setBonusPercent] = useState('')
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const packs = useMemo(() => state.packs.filter(p => p.productId === props.id && !p.isOffer && !p.byWeight)
  , [state.packs, props.id])
  const bonusPacks = useMemo(() => {
    let packs = state.packs.filter(p => p.productId !== props.id && !p.isOffer && !p.byWeight)
    packs = packs.map(p => {
      const productInfo = state.products.find(pr => pr.id === p.productId)
      return {
        id: p.id,
        name: `${productInfo.name} - ${p.name}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.packs, state.products, props.id]) 

  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handleSubmit = async () => {
    try{
      if (Number(offerPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      const offerPackInfo = state.packs.find(p => p.id === offerPackId)
      const pack = {
        productId: props.id,
        name,
        isOffer: true,
        price: 0,
        offerPackId,
        offerQuantity: Number(offerQuantity),
        offerPercent: Number(offerPercent),
        unitsCount: Number(offerQuantity) * (offerPackInfo.unitsCount + (offerPackInfo.bonusUnits ? offerPackInfo.bonusUnits : 0)),
        isDivided: offerPackInfo.isDivided,
        byWeight: offerPackInfo.byWeight,
        orderLimit: Number(orderLimit),
        bonusPackId,
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: Number(bonusPercent),
        time: new Date()
      }
      await addPack(pack)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(err, state.labels, props.f7route.route.component.name))
		}
  }
  if (!user) return <ReLogin />
  return (
    <Page>
      <Navbar title={`${state.labels.addOffer} - ${product.name}`} backLink={state.labels.back} />
      <List>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="offerPackId" value={offerPackId} onChange={e => setOfferPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="offerQuantity" 
          label={state.labels.quantity}
          value={offerQuantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setOfferQuantity(e.target.value)}
          onInputClear={() => setOfferQuantity('')}
        />
        <ListInput 
          name="offerPercent" 
          label={state.labels.percent}
          value={offerPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setOfferPercent(e.target.value)}
          onInputClear={() => setOfferPercent('')}
        />
        <ListInput 
          name="orderLimit" 
          label={state.labels.packLimit}
          floatingLabel 
          clearButton
          type="number" 
          value={orderLimit} 
          onChange={e => setOrderLimit(e.target.value)}
          onInputClear={() => setOrderLimit('')}
        />
      </List>
      <BlockTitle>
        {state.labels.bonusProduct}
      </BlockTitle>
      <List>
        <ListItem
          title={state.labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: state.labels.search,
            popupCloseLinkText: state.labels.close
          }}
        >
          <select name="bonusPackId" value={bonusPackId} onChange={e => setBonusPackId(e.target.value)}>
            <option value=""></option>
            {bonusPacks.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="bonusQuantity" 
          label={state.labels.quantity}
          value={bonusQuantity}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setBonusQuantity(e.target.value)}
          onInputClear={() => setBonusQuantity('')}
        />
        <ListInput 
          name="bonusPercent" 
          label={state.labels.percent}
          value={bonusPercent}
          clearButton
          floatingLabel 
          type="number" 
          onChange={e => setBonusPercent(e.target.value)}
          onInputClear={() => setBonusPercent('')}
        />
      </List>
      {!name || !offerPackId || !offerQuantity  || !offerPercent ? '' :
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddOffer