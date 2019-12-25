import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons, Button } from 'framework7-react'
import { StoreContext } from '../data/Store'
import { refreshPackPrice, showMessage, showError, getMessage, quantityText } from '../data/Actions'
import BottomToolbar from './BottomToolbar';
import PackImage from './PackImage'

const PackDetails = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const packStores = useMemo(() => {
    let packStores = state.storePacks.filter(p => (p.packId === pack.id || state.packs.find(pa => pa.id === p.packId && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))))
    packStores = packStores.map(s => {
      let packId, unitCost, quantity, offerInfo, isOffer
      if (s.packId === pack.id) {
        packId = s.packId
        unitCost = s.storeId === 's' || !s.quantity ? s.cost : parseInt(s.cost / s.quantity) 
        quantity = s.quantity
        isOffer = false
      } else {
        offerInfo = state.packs.find(p => p.id === s.packId && p.subPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id
          unitCost = parseInt((s.cost / offerInfo.subQuantity) * (offerInfo.subPercent / 100))
          quantity = offerInfo.subQuantity
          isOffer = (s.cost === s.price) // false for type 5
        } else {
          offerInfo = state.packs.find(p => p.id === s.packId && p.bonusPackId === pack.id)
          if (offerInfo) {
            packId = offerInfo.id
            unitCost = parseInt((s.cost / offerInfo.bonusQuantity) * (offerInfo.bonusPercent / 100))
            quantity = offerInfo.bonusQuantity
            isOffer = true
          }
        }
      }
      return {
        ...s,
        packId,
        quantity,
        unitCost,
        isOffer
      }
    })
    packStores = packStores.filter(s => s.packId)
    const today = new Date()
    today.setDate(today.getDate() - 30)
    return packStores.sort((s1, s2) => 
    {
      if (s1.unitCost === s2.unitCost) {
        const store1 = state.stores.find(s => s.id === s1.storeId)
        const store2 = state.stores.find(s => s.id === s2.storeId)
        if (store1.type === store2.type){
          if (store2.discount === store1.discount) {
            const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time.toDate() < today)
            const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time.toDate() < today)
            const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
            const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
            return store1Sales - store2Sales
          } else {
            return Number(store2.discount) - Number(store1.discount)
          }
        } else {
          return Number(store1.type) - Number(store2.type)
        }
      } else {
        return s1.unitCost - s2.unitCost
      }
    })
  }, [pack, state.stores, state.storePacks, state.purchases, state.packs])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])
  const handlePurchase = packStore => {
		try{
      if (packStore.offerEnd && new Date() > packStore.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== packStore.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs && state.basket.packs.find(p => p.packId === packStore.packId)) {
        throw new Error('duplicatePacKInBasket')
      }
      const packInfo = state.packs.find(p => p.id === packStore.packId)
      let params
      if (packInfo.byWeight) {
        props.f7router.app.dialog.prompt(state.labels.enterWeight, state.labels.actualWeight, async weight => {
          params = {
            pack: packInfo,
            packStore,
            quantity : packInfo.isDivided ? Number(weight) : 1,
            price: packStore.price,
            orderId: props.orderId,
            weight: Number(weight),
            increment: 1
          }
          dispatch({type: 'ADD_TO_BASKET', params})
          showMessage(props, state.labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        params = {
          pack: packInfo, 
          packStore,
          quantity: 1,
          price: packStore.price,
          orderId: props.orderId,
          increment: 1,
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(props, state.labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
	}
  const handleRefreshPrice = async () => {
    try{
      await refreshPackPrice(pack, state.storePacks, state.packs)
      showMessage(props, state.labels.refreshSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={product.name} backLink={state.labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{pack.name}</div>
          <PackImage pack={pack} type="card" />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 1000).toFixed(3)}</p>
        </CardFooter>
      </Card>
      <List mediaList>
      {packStores.map(s => {
        const storeInfo = state.stores.find(st => st.id === s.storeId)
        return (
          <ListItem 
            title={storeInfo.name}
            subtitle={`${state.labels.unitCost}: ${(s.unitCost / 1000).toFixed(3)}`}
            text={`${state.labels.price}: ${(s.price / 1000).toFixed(3)}`}
            footer={s.quantity > 0 ? `${state.labels.quantity}: ${quantityText(s.quantity)}` : ''}
            key={s.id}
          >
            {s.isOffer || s.offerEnd ? 
              <Badge slot="title" color='green'>{state.labels.offer}</Badge> 
            : ''}
            {s.storeId === 's' ? '' :
              <Button slot="after" onClick={() => handlePurchase(s)}>{state.labels.purchase}</Button>
            }
          </ListItem>
        )
      })}
      </List>
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/addPackStore/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/${pack.isOffer ? 'editOffer' : (pack.subPackId ? 'editBulk' : 'editPack')}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => handleRefreshPrice()}>
            <Icon material="cached"></Icon>
          </FabButton>
          <FabButton color="red" onClick={() => props.f7router.navigate(`/packTrans/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
