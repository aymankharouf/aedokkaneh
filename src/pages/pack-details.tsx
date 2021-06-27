import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, Link, List, ListItem, Icon, Fab, Toolbar, Badge, FabButton, FabButtons, FabBackdrop, Actions, ActionsButton } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { getPackStores, deleteStorePack, refreshPackPrice, deletePack, changeStorePackStatus, showMessage, showError, getMessage, quantityText } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import labels from '../data/labels'
import { Pack, PackPrice, Store } from '../data/types'

type Props = {
  id: string
}
type ExtendedPackPrice = PackPrice & {
  subQuantity: number,
  unitPrice: number,
  unitCost: number,
  isOffer: boolean,
  packInfo: Pack,
  storeInfo: Store
}
const PackDetails = (props: Props) => {
  const { state, dispatch } = useContext(StateContext)
  const [error, setError] = useState('')
  const [currentStorePack, setCurrentStorePack] = useState<ExtendedPackPrice>()
  const actionsList = useRef<Actions>(null)
  const [pack, setPack] = useState(() => state.packs.find(p => p.id === props.id)!)
  const [packStores, setPackStores] = useState<ExtendedPackPrice[]>([])
  const [detailsCount, setDetailsCount] = useState(0)
  useEffect(() => {
    setDetailsCount(() => {
      const detailsCount = state.packPrices.filter(p => p.packId === pack.id).length
      return detailsCount === 0 ? state.orders.filter(o => o.basket.find(p => p.packId === pack.id)).length : detailsCount
    })
  }, [pack, state.orders, state.packPrices])
  useEffect(() => {
    setPackStores(() => {
      const packStores = getPackStores(pack, state.packPrices, state.packs)
      const result = packStores.map(p => {
        const packInfo = state.packs.find(pp => pp.id === p.packId)!
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          packInfo,
          storeInfo
        }
      })
      const today = new Date()
      today.setDate(today.getDate() - 30)
      return result.sort((s1, s2) => 
      {
        if (s1.unitPrice === s2.unitPrice) {
          if (s1.storeInfo.type === s2.storeInfo.type){
            if (s2.storeInfo.discount === s1.storeInfo.discount) {
              const store1Purchases = state.purchases.filter(p => p.storeId === s1.storeId && p.time < today)
              const store2Purchases = state.purchases.filter(p => p.storeId === s2.storeId && p.time < today)
              const store1Sales = store1Purchases.reduce((sum, p) => sum + p.total, 0)
              const store2Sales = store2Purchases.reduce((sum, p) => sum + p.total, 0)
              return store1Sales - store2Sales
            } else {
              return Number(s2.storeInfo.discount) - Number(s1.storeInfo.discount)
            }
          } else {
            return Number(s1.storeInfo.type) - Number(s2.storeInfo.type)
          }
        } else {
          return s1.unitPrice - s2.unitPrice
        }
      })
    })
  }, [pack, state.stores, state.packPrices, state.purchases, state.packs])
  useEffect(() => {
    setPack(() => state.packs.find(p => p.id === props.id)!)
  }, [state.packs, state.packPrices, state.orders, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRefreshPrice = () => {
    try{
      refreshPackPrice(pack, state.packPrices)
      showMessage(labels.refreshSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deletePack(pack.id!)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  const handleDeletePrice = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        if (!currentStorePack) return
        deleteStorePack(currentStorePack, state.packPrices, state.packs)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  const handlePurchase = () => {
		try{
      if (currentStorePack?.offerEnd && new Date() > currentStorePack.offerEnd) {
        throw new Error('offerEnded')
      }
			if (state.basket?.storeId && state.basket.storeId !== currentStorePack?.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket?.packs?.find(p => p.packId === pack.id)) {
        throw new Error('alreadyInBasket')
      }
      let params
      if (pack.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, weight => {
          params = {
            pack,
            packStore: currentStorePack,
            quantity : pack.isDivided ? +weight : 1,
            price: currentStorePack?.price,
            weight: +weight,
          }
          dispatch({type: 'ADD_TO_BASKET', payload: params})
          showMessage(labels.addToBasketSuccess)
          f7.views.current.router.back()
        })
      } else {
        params = {
          pack, 
          packStore: currentStorePack,
          quantity: 1,
          price: currentStorePack?.price,
          weight: 0,
          orderId: '',
          refPackId: '',
          refPackQuantity: 0,
          exceedPriceType: ''
        }
        dispatch({type: 'ADD_TO_BASKET', payload: params})
        showMessage(labels.addToBasketSuccess)
        f7.views.current.router.back()
      }
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleChangeStatus = () => {
    try{
      if (!currentStorePack) return
      changeStorePackStatus(currentStorePack, state.packPrices, state.packs)
      showMessage(labels.editSuccess)
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  const handleActions = (storePackInfo: ExtendedPackPrice) => {
    const storePack = {
      ...storePackInfo,
      packId: pack.id!
    }
    setCurrentStorePack(storePack)
    actionsList.current?.open()
  }
  let i = 0
  return (
    <Page>
      <Navbar title={`${pack.productName}${pack.productAlias ? '-' + pack.productAlias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <div className="card-title">{`${pack.name}${pack.closeExpired ? '(' + labels.closeExpired + ')' : ''}`}</div>
          <img src={pack.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{(pack.price / 100).toFixed(2)}</p>
          <p>{pack.unitsCount}</p>
        </CardFooter>
      </Card>
      <List mediaList>
        {packStores.map(s => 
          <ListItem 
            title={s.storeInfo.name}
            subtitle={s.packId === pack.id ? '' : `${s.packInfo.productName}${s.packInfo.productAlias ? '-' + s.packInfo.productAlias : ''}`}
            text={s.packId === pack.id ? '' : s.packInfo.name}
            footer={s.quantity > 0 ? `${labels.balance}: ${quantityText(s.quantity, s.weight)}` : ''}
            key={i++}
            className={currentStorePack?.storeId === s.storeId && currentStorePack?.packId === s.packId ? 'selected' : ''}
          >
            <div className="list-subtext1">{`${labels.price}: ${(s.price / 100).toFixed(2)}${s.price === s.unitPrice ? '' : '(' + (s.unitPrice / 100).toFixed(2) + ')'}`}</div>
            <div className="list-subtext2">{`${labels.cost}: ${(s.cost / 100).toFixed(2)}${s.cost === s.unitCost ? '' : '(' + (s.unitCost / 100).toFixed(2) + ')'}`}</div>
            <div className="list-subtext3">{s.subQuantity ? `${labels.quantity}: ${s.subQuantity}` : ''}</div>
            {s.offerEnd ? <div className="list-subtext4">{labels.offerUpTo}: {moment(s.offerEnd).format('Y/M/D')}</div> : ''}
            {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
            {s.packId === pack.id && !s.isAuto ? <Link slot="after" iconMaterial="more_vert" onClick={()=> handleActions(s)}/> : ''}
          </ListItem>
        )}
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-pack-store/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          <FabButton color="blue" onClick={() => f7.views.current.router.navigate(`/${pack.isOffer ? 'edit-offer' : (pack.subPackId ? 'edit-bulk' : 'edit-pack')}/${props.id}`)}>
            <Icon material="edit"></Icon>
          </FabButton>
          <FabButton color="yellow" onClick={() => handleRefreshPrice()}>
            <Icon material="cached"></Icon>
          </FabButton>
          <FabButton color="pink" onClick={() => f7.views.current.router.navigate(`/pack-operations/${props.id}`)}>
            <Icon material="import_export"></Icon>
          </FabButton>
          {detailsCount === 0 ? 
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
        </FabButtons>
      </Fab>
      <Actions ref={actionsList}>
        {currentStorePack?.storeId === 's' ? '' :
          <ActionsButton onClick={() => handleChangeStatus()}>{currentStorePack?.isActive ? labels.deactivate : labels.activate}</ActionsButton>
        }
        {currentStorePack?.storeId === 's' && currentStorePack?.quantity === 0 ? '' : 
          <ActionsButton onClick={() => f7.views.current.router.navigate(`/edit-price/${currentStorePack?.packId}/store/${currentStorePack?.storeId}`)}>{labels.editPrice}</ActionsButton>
        }
        {currentStorePack?.storeId === 's' ? '' :
          <ActionsButton onClick={() => handleDeletePrice()}>{labels.delete}</ActionsButton>
        }
        {currentStorePack?.storeId === 's' ? '' :
          <ActionsButton onClick={() => handlePurchase()}>{labels.purchase}</ActionsButton>
        }
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
