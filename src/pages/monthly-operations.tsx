import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { addMonthlyOperation, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'
import Footer from './footer'

type Params = {
  id: string
}
const MonthlyOperations = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = (Number(params.id) % 100) - 1
  const year = Math.trunc(Number(params.id) / 100)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [monthlyOperation] = useState(() => state.monthlyOperations.find(t => t.id === Number(params.id))!)
  const [orders] = useState(() => state.orders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.time).getFullYear() === year && (o.time).getMonth() === month))
  const [finishedOrders] = useState(() => orders.filter(o => ['f', 'p'].includes(o.status)))
  const [deliveredOrders] = useState(() => orders.filter(o => o.status === 'd'))
  const [ordersCount] = useState(() => monthlyOperation.ordersCount ?? orders.length)
  const [deliveredOrdersCount] = useState(() => monthlyOperation.deliveredOrdersCount ?? deliveredOrders.length)
  const [finishedOrdersCount] = useState(() => monthlyOperation.finishedOrdersCount ?? finishedOrders.length)
  const [stock] = useState(() => {
    if (monthlyOperation) return monthlyOperation.stock
    const stockPacks = state.packPrices.filter(p => p.storeId === 's' && p.quantity > 0)
    return stockPacks.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
  })
  const [sales] = useState(() => monthlyOperation.sales ?? deliveredOrders.reduce((sum, o) => sum + o.total, 0))
  const [operationProfit] = useState(() => monthlyOperation.operationProfit ?? deliveredOrders.reduce((sum, o) => sum + o.profit, 0))
  const [fixedFees] = useState(() => monthlyOperation.fixedFees ?? deliveredOrders.reduce((sum, o) => sum + o.fixedFees, 0))
  const [deliveryFees] = useState(() => monthlyOperation.deliveryFees ?? deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0))
  const [fractions] = useState(() => monthlyOperation.fractions ?? deliveredOrders.reduce((sum, o) => sum + o.fraction, 0))
  const [discounts] = useState(() => monthlyOperation.discounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? 0 : o.discount.value), 0))
  const [specialDiscounts] = useState(() => monthlyOperation.specialDiscounts ?? deliveredOrders.reduce((sum, o) => sum + (o.discount.type === 's' ? o.discount.value : 0), 0))
  const [storesBalance] = useState(() => {
    let sum = 0
    state.stores.forEach(s => {
      sum += s.balances?.filter(b => b.month === year * 100 + month)?.reduce((sum, b) => sum + b.balance, 0) || 0
    })
    return monthlyOperation.storesBalance ?? sum
  })
  const [storePayments] = useState(() => state.storePayments.filter(p => (p.paymentDate).getFullYear() === year && (p.paymentDate).getMonth() === month))
  const [spendings] = useState(() => state.spendings.filter(s => (s.spendingDate).getFullYear() === year && (s.spendingDate).getMonth() === month))
  const [stockOperations] = useState(() => state.stockOperations.filter(t => (t.time).getFullYear() === year && (t.time).getMonth() === month))
  const [donations] = useState(() => monthlyOperation.donations ?? stockOperations.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0))
  const [damages] = useState(() => monthlyOperation.damages ?? stockOperations.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0))
  const [storesProfit] = useState(() => monthlyOperation.storesProfit ?? storePayments.reduce((sum, p) => sum + (p.type === 'c' ? p.amount : 0), 0))
  const [operationNet] = useState(() => monthlyOperation.operationNet ?? storePayments.reduce((sum, p) => sum + (['pp', 'sp', 'rp'].includes(p.type) ? -1 * p.amount : (['pl', 'sl', 'rl'].includes(p.type) ? p.amount : 0)), 0))
  const [withdrawals] = useState(() => {
    if (monthlyOperation) return monthlyOperation.withdrawals
    const withdrawals = spendings.filter(s => s.type === 'w')
    return withdrawals.reduce((sum, s) => sum + s.amount, 0)
  })
  const [expenses] = useState(() => {
    if (monthlyOperation) return monthlyOperation.expenses
    const expenses = spendings.filter(s => s.type !== 'w')
    return expenses.reduce((sum, s) => sum + s.amount, 0)
  })
  const [netProfit] = useState(() => monthlyOperation.netProfit ?? (operationProfit + storesProfit + operationNet + fixedFees + deliveryFees) - (discounts + expenses + damages + fractions))
  useEffect(() => {
    const today = new Date()
    if ((today.getFullYear() * 100 + Number(today.getMonth())) > year * 100 + month) {
      setButtonVisible(monthlyOperation ? false : true)
    } else {
      setButtonVisible(false)
    }
  }, [year, month, monthlyOperation])
  const handleMonthlyOperation = () => {
    try{
      const operation = {
        id: Number(params.id),
        ordersCount,
        finishedOrdersCount,
        deliveredOrdersCount,
        stock,
        sales,
        operationProfit,
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
        operationNet,
        specialDiscounts,
        netProfit
      }
      addMonthlyOperation(operation, state.orders, state.purchases, state.stockOperations)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={`${labels.monthlyOperations} ${month + 1}-${year}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel>{labels.ordersCount}</IonLabel>
            <IonLabel slot="end" className="price">{ordersCount}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.finishedOrdersCount}</IonLabel>
            <IonLabel slot="end" className="price">{finishedOrdersCount}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.deliveredOrdersCount}</IonLabel>
            <IonLabel slot="end" className="price">{deliveredOrdersCount}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.stock}</IonLabel>
            <IonLabel slot="end" className="price">{(stock / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.sales}</IonLabel>
            <IonLabel slot="end" className="price">{(sales / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.operationProfit}</IonLabel>
            <IonLabel slot="end" className="price">{(operationProfit / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.storesProfit}</IonLabel>
            <IonLabel slot="end" className="price">{(storesProfit / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.fixedFees}</IonLabel>
            <IonLabel slot="end" className="price">{(fixedFees / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.deliveryFees}</IonLabel>
            <IonLabel slot="end" className="price">{(deliveryFees / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.storesBalance}</IonLabel>
            <IonLabel slot="end" className="price">{(storesBalance / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.grossProfit}</IonLabel>
            <IonLabel slot="end" className="price">{((operationProfit + storesProfit + operationNet + fixedFees + deliveryFees) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.discounts}</IonLabel>
            <IonLabel slot="end" className="price">{(discounts / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.fractions}</IonLabel>
            <IonLabel slot="end" className="price">{(fractions / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.expenses}</IonLabel>
            <IonLabel slot="end" className="price">{(expenses / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.damages}</IonLabel>
            <IonLabel slot="end" className="price">{(damages / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.operationNet}</IonLabel>
            <IonLabel slot="end" className="price">{(operationNet / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.grossLoss}</IonLabel>
            <IonLabel slot="end" className="price">{((discounts + expenses + damages + fractions) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.netProfit}</IonLabel>
            <IonLabel slot="end" className="price">{(netProfit / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.specialDiscount}</IonLabel>
            <IonLabel slot="end" className="price">{(specialDiscounts / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.donations}</IonLabel>
            <IonLabel slot="end" className="price">{(donations / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.donationsBalance}</IonLabel>
            <IonLabel slot="end" className="price">{((Math.round(netProfit * 0.2) - donations - specialDiscounts) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.withdrawals}</IonLabel>
            <IonLabel slot="end" className="price">{(withdrawals / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.propertyBalance}</IonLabel>
            <IonLabel slot="end" className="price">{((netProfit - Math.round(netProfit * 0.2) - withdrawals) / 100).toFixed(2)}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
      {buttonVisisble && 
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleMonthlyOperation} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}

export default MonthlyOperations
