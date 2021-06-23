import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { addMonthlyTrans, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const MonthlyTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = (Number(props.id) % 100) - 1
  const year = Math.trunc(Number(props.id) / 100)
  const [monthlyTrans] = useState(() => state.monthlyTrans.find(t => t.id === props.id))
  const [orders] = useState(() => state.orders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.time.toDate()).getFullYear() === year && (o.time.toDate()).getMonth() === month))
  const [finishedOrders] = useState(() => orders.filter(o => ['f', 'p'].includes(o.status)))
  const [deliveredOrders] = useState(() => orders.filter(o => o.status === 'd'))
  const [ordersCount] = useState(() => monthlyTrans?.ordersCount ?? orders.length)
  const [deliveredOrdersCount] = useState(() => monthlyTrans?.deliveredOrdersCount ?? deliveredOrders.length)
  const [finishedOrdersCount] = useState(() => monthlyTrans?.finishedOrdersCount ?? finishedOrders.length)
  const [stock] = useState(() => {
    if (monthlyTrans) return monthlyTrans.stock
    const stockPacks = state.packPrices.filter(p => p.storeId === 's' && p.quantity > 0)
    return stockPacks.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
  })
  const [sales] = useState(() => monthlyTrans?.sales ?? deliveredOrders.reduce((sum, o) => sum + o.total, 0))
  const [transProfit] = useState(() => monthlyTrans?.transProfit ?? deliveredOrders.reduce((sum, o) => sum + o.profit, 0))
  const [fixedFees] = useState(() => monthlyTrans?.fixedFees ?? deliveredOrders.reduce((sum, o) => sum + o.fixedFees, 0))
  const [deliveryFees] = useState(() => monthlyTrans?.deliveryFees ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0))
  const [fractions] = useState(() => monthlyTrans?.fractions ?? deliveredOrders.reduce((sum, o) => sum + o.fraction, 0))
  const [discounts] = useState(() => monthlyTrans?.discounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? 0 : o.discount.value), 0))
  const [specialDiscounts] = useState(() => monthlyTrans?.specialDiscounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? o.discount.value : 0), 0))
  const [storesBalance] = useState(() => {
    let sum = 0
    state.stores.forEach(s => {
      sum += s.balances?.filter(b => b.month === year * 100 + month)?.reduce((sum, b) => sum + b.balance, 0) || 0
    })
    return monthlyTrans?.storesBalance ?? sum
  })
  const [storePayments] = useState(() => state.storePayments.filter(p => (p.paymentDate.toDate()).getFullYear() === year && (p.paymentDate.toDate()).getMonth() === month))
  const [spendings] = useState(() => state.spendings.filter(s => (s.spendingDate.toDate()).getFullYear() === year && (s.spendingDate.toDate()).getMonth() === month))
  const [stockTrans] = useState(() => state.stockTrans.filter(t => (t.time.toDate()).getFullYear() === year && (t.time.toDate()).getMonth() === month))
  const [donations] = useState(() => monthlyTrans?.donations ?? stockTrans.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0))
  const [damages] = useState(() => monthlyTrans?.damages ?? stockTrans.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0))
  const [storesProfit] = useState(() => monthlyTrans?.storesProfit ?? storePayments.reduce((sum, p) => sum + (p.type === 'c' ? p.amount : 0), 0))
  const [storeTransNet] = useState(() => monthlyTrans?.storeTransNet ?? storePayments.reduce((sum, p) => sum + ['pp', 'sp', 'rp'].includes(p.type) ? -1 * p.amount : (['pl', 'sl', 'rl'].includes(p.type) ? p.amount : 0), 0))
  const [withdrawals] = useState(() => {
    if (monthlyTrans) return monthlyTrans.withdrawals
    const withdrawals = spendings.filter(s => s.type === 'w')
    return withdrawals.reduce((sum, s) => sum + s.amount, 0)
  })
  const [expenses] = useState(() => {
    if (monthlyTrans) return monthlyTrans.expenses
    const expenses = spendings.filter(s => s.type !== 'w')
    return expenses.reduce((sum, s) => sum + s.amount, 0)
  })
  const [netProfit] = useState(() => monthlyTrans?.netProfit ?? (transProfit + storesProfit + storeTransNet + fixedFees + deliveryFees) - (discounts + expenses + damages + fractions))
  useEffect(() => {
    const today = new Date()
    if ((today.getFullYear() * 100 + Number(today.getMonth())) > year * 100 + month) {
      setButtonVisible(monthlyTrans ? false : true)
    } else {
      setButtonVisible(false)
    }
  }, [year, month, monthlyTrans])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleMonthlyTrans = () => {
    try{
      const trans = {
        id: props.id,
        ordersCount,
        finishedOrdersCount,
        deliveredOrdersCount,
        stock,
        sales,
        transProfit,
        fixedFees,
        deliveryFees,
        fractions,
        storesBalance,
        discounts,
        withdrawals,
        expenses,
        donations,
        damages,
        storesProfit,
        storeTransNet,
        specialDiscounts,
        netProfit
      }
      addMonthlyTrans(trans, state.orders, state.purchases, state.stockTrans)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return(
    <Page>
      <Navbar title={`${labels.monthlyTrans} ${month + 1}-${year}`} backLink={labels.back} />
      <Block>
        <List>
          <ListItem
            title={labels.ordersCount}
            after={ordersCount}
          />
          <ListItem
            title={labels.finishedOrdersCount}
            after={finishedOrdersCount}
          />
          <ListItem
            title={labels.deliveredOrdersCount}
            after={deliveredOrdersCount}
          />
          <ListItem
            title={labels.stock}
            after={(stock / 100).toFixed(2)}
          />
          <ListItem
            title={labels.sales}
            after={(sales / 100).toFixed(2)}
          />
          <ListItem
            title={labels.transProfit}
            after={(transProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storesProfit}
            after={(storesProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.fixedFees}
            after={(fixedFees / 100).toFixed(2)}
          />
          <ListItem
            title={labels.deliveryFees}
            after={(deliveryFees / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storesBalance}
            after={(storesBalance / 100).toFixed(2)}
          />
          <ListItem
            title={labels.grossProfit}
            after={((transProfit + storesProfit + storeTransNet + fixedFees + deliveryFees) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.discounts}
            after={(discounts / 100).toFixed(2)}
          />
          <ListItem
            title={labels.fractions}
            after={(fractions / 100).toFixed(2)}
          />
          <ListItem
            title={labels.expenses}
            after={(expenses / 100).toFixed(2)}
          />
          <ListItem
            title={labels.damages}
            after={(damages / 100).toFixed(2)}
          />
          <ListItem
            title={labels.storeTransNet}
            after={(storeTransNet / 100).toFixed(2)}
          />
          <ListItem
            title={labels.grossLoss}
            after={((discounts + expenses + damages + fractions) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.netProfit}
            after={(netProfit / 100).toFixed(2)}
          />
          <ListItem
            title={labels.specialDiscount}
            after={(specialDiscounts / 100).toFixed(2)}
          />
          <ListItem
            title={labels.donations}
            after={(donations / 100).toFixed(2)}
          />
          <ListItem
            title={labels.donationsBalance}
            after={((Math.round(netProfit * 0.2) - donations - specialDiscounts) / 100).toFixed(2)}
          />
          <ListItem
            title={labels.withdrawals}
            after={(withdrawals / 100).toFixed(2)}
          />
          <ListItem
            title={labels.propertyBalance}
            after={((netProfit - Math.round(netProfit * 0.2) - withdrawals) / 100).toFixed(2)}
          />
        </List>
      </Block>
      {buttonVisisble ? 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleMonthlyTrans()}>
          <Icon material="done"></Icon>
        </Fab>
      : ''}
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default MonthlyTrans
