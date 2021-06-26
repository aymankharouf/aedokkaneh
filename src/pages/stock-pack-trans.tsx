import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import { showMessage, showError, getMessage, quantityText, unfoldStockPack } from '../data/actionst'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'
import { iPurchase, iStockPack, iStore } from '../data/interfaces'

interface Props {
  id: string
}
interface ExtendedStockPack extends iStockPack {
  storeInfo: iStore,
  id: string,
  purchaseId: string,
  type: string,
  time: Date
}
const StockPackTrans = (props: Props) => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id)!)
  const [stockPackInfo] = useState(() => state.packPrices.find(p => p.storeId === 's' && p.packId === props.id)!)
  const actionsList = useRef<Actions>(null)
  const [packTrans, setPackTrans] = useState<ExtendedStockPack[]>([])
  const [lastPurchase] = useState<ExtendedStockPack>(() => {
    const purchases = state.purchases.filter(p => p.basket.find(bp => bp.packId === pack.id))
    const result = purchases.map(p => {
      const transPack = p.basket.find(bp => bp.packId === pack.id)!
      const storeInfo = state.stores.find(s => s.id === p.storeId)!
      return {
        ...transPack,
        storeInfo,
        id: '',
        type: '',
        purchaseId: p.id!,
        time: p.time
      }
    })
    result.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    return result[0]
  })
  useEffect(() => {
    setPackTrans(() => {
      const packTrans = state.stockTrans.filter(t => t.basket.find(p => p.packId === pack.id))
      const result = packTrans.map(t => {
        const transPack = t.basket.find(p => p.packId === pack.id)!
        const storeInfo = state.stores.find(s => s.id === t.storeId)!
        return {
          ...transPack,
          id: t.id!,
          purchaseId: t.purchaseId,
          type: t.type,
          time: t.time,
          storeInfo
        }
      })
      return result.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [state.stockTrans, state.stores, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAddTrans = (type: string) => {
    f7.dialog.prompt(labels.enterQuantity, labels.quantity, quantity => {
      try{
        if (state.returnBasket?.packs?.find(p => p.packId === pack.id)) {
          throw new Error('alreadyInBasket')
        }
        if (Number(quantity) > stockPackInfo.quantity) {
          throw new Error('invalidValue')
        }
        if (state.returnBasket && state.returnBasket.type !== type) {
          throw new Error('diffTypeInReturnBasket')
        }
        if (type === 'r' && state.returnBasket && state.returnBasket.purchaseId !== lastPurchase?.purchaseId) {
          throw new Error('diffPurchaseInReturnBasket')
        }
        const params = {
          type,
          packId: pack.id,
          cost: type === 'r' ? lastPurchase.cost : stockPackInfo.cost,
          price: type === 'r' ? lastPurchase.price : stockPackInfo.price,
          quantity: Number(quantity),
          storeId: type === 'r' ? lastPurchase.storeInfo.id : '',
          purchaseId: type === 'r' ? lastPurchase.purchaseId : '',
          weight: pack.byWeight ? Number(quantity) : 0
        }
        dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
        showMessage(labels.addToBasketSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }      
    })
  }
  const handleOpen = () => {
    try{
      unfoldStockPack(stockPackInfo, state.packPrices, state.packs, state.stores)
      showMessage(labels.executeSuccess)
      f7.views.current.router.back()
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }      
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packTrans.map(t => 
              <ListItem
                title={`${stockTransTypes.find(tt => tt.id === t.type)?.name} ${t.storeInfo?.name || ''}`}
                subtitle={`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}
                text={`${labels.price}: ${(t.cost / 100).toFixed(2)}`}
                footer={moment(t.time).fromNow()}
                key={t.id}
              />
            )
          }
        </List>
      </Block>
      {stockPackInfo.quantity === 0 ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => actionsList.current?.open()}>
          <Icon material="build"></Icon>
        </Fab>
      }
      <Actions ref={actionsList}>
        {pack.subPackId ? 
          <ActionsButton onClick={() => handleOpen()}>{labels.open}</ActionsButton>
        : ''}
        {lastPurchase?.storeInfo?.allowReturn ? 
          <ActionsButton onClick={() => handleAddTrans('r')}>{labels.return}</ActionsButton>
        : ''}
        <ActionsButton onClick={() => handleAddTrans('g')}>{labels.donate}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('d')}>{labels.destroy}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('s')}>{labels.sell}</ActionsButton>
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
