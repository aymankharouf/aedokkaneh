import { useState, useEffect, useMemo } from 'react'
import { addMonthlyOperation, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'
import Footer from './footer'
import { Err, MonthlyOperation, Order, PackPrice, Purchase, Spending, State, Stock, StockOperation, Store } from '../data/types'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const MonthlyOperations = () => {
  const stateMonthlyOperations = useSelector<State, MonthlyOperation[]>(state => state.monthlyOperations)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateSpendings = useSelector<State, Spending[]>(state => state.spendings)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const params = useParams<Params>()
  const [buttonVisisble, setButtonVisible] = useState(false)
  const month = useMemo(() => (Number(params.id) % 100) - 1, [params.id])
  const year = useMemo(() => Math.trunc(Number(params.id) / 100), [params.id])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const monthlyOperation = useMemo(() => stateMonthlyOperations.find(t => t.id === Number(params.id)), [stateMonthlyOperations, params.id])
  const orders = useMemo(() => stateOrders.filter(o => ['a', 'e', 'f', 'p', 'd'].includes(o.status) && (o.lastUpdate).getFullYear() === year && (o.lastUpdate).getMonth() === month), [stateOrders, year, month])
  const finishedOrders = useMemo(() => orders.filter(o => ['f', 'p'].includes(o.status)), [orders])
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'd'), [orders])
  const ordersCount = useMemo(() => monthlyOperation?.ordersCount || orders.length, [monthlyOperation, orders])
  const deliveredOrdersCount = useMemo(() => monthlyOperation?.deliveredOrdersCount || deliveredOrders.length, [monthlyOperation, deliveredOrders])
  const finishedOrdersCount = useMemo(() => monthlyOperation?.finishedOrdersCount || finishedOrders.length, [monthlyOperation, finishedOrders])
  const stock = useMemo(() => monthlyOperation?.stock || stateStocks.filter(s => s.quantity > 0).reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0), [monthlyOperation, statePackPrices])
  const sales = useMemo(() => monthlyOperation?.sales || deliveredOrders.reduce((sum, o) => sum + o.total, 0), [monthlyOperation, deliveredOrders])
  const operationProfit = useMemo(() => monthlyOperation?.operationProfit || deliveredOrders.reduce((sum, o) => sum + o.profit, 0), [monthlyOperation, deliveredOrders])
  const deliveryFees = useMemo(() => monthlyOperation?.deliveryFees || deliveredOrders.reduce((sum, o) => sum + o.deliveryFees, 0), [monthlyOperation, deliveredOrders])
  const fractions = useMemo(() => monthlyOperation?.fractions || deliveredOrders.reduce((sum, o) => sum + o.fraction, 0), [monthlyOperation, deliveredOrders])
  const spendings = useMemo(() => stateSpendings.filter(s => (s.spendingDate).getFullYear() === year && (s.spendingDate).getMonth() === month), [stateSpendings, year, month])
  const stockOperations = useMemo(() => stateStockOperations.filter(t => (t.time).getFullYear() === year && (t.time).getMonth() === month), [stateStockOperations, year, month])
  const donations = useMemo(() => monthlyOperation?.donations || stockOperations.reduce((sum, t) => sum + (t.type === 'g' ? t.total : 0), 0), [monthlyOperation, stockOperations])
  const damages = useMemo(() => monthlyOperation?.damages || stockOperations.reduce((sum, t) => sum + (t.type === 'd' ? t.total : 0), 0), [monthlyOperation, stockOperations])
  const withdrawals = useMemo(() => monthlyOperation?.withdrawals || spendings.filter(s => s.type === 'w').reduce((sum, s) => sum + s.amount, 0), [monthlyOperation, spendings])
  const expenses = useMemo(() => monthlyOperation?.expenses || spendings.filter(s => s.type !== 'w').reduce((sum, s) => sum + s.amount, 0), [monthlyOperation, spendings])
  const netProfit = useMemo(() => monthlyOperation?.netProfit || (operationProfit + deliveryFees) - (expenses + damages + fractions), [monthlyOperation, operationProfit, deliveryFees, expenses, damages, fractions])
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
        deliveryFees,
        fractions,
        withdrawals,
        expenses,
        donations,
        damages,
        netProfit
      }
      addMonthlyOperation(operation, stateOrders, statePurchases, stateStockOperations)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
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
            <IonLabel>{labels.deliveryFees}</IonLabel>
            <IonLabel slot="end" className="price">{(deliveryFees / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.grossProfit}</IonLabel>
            <IonLabel slot="end" className="price">{((operationProfit + deliveryFees) / 100).toFixed(2)}</IonLabel>
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
            <IonLabel>{labels.grossLoss}</IonLabel>
            <IonLabel slot="end" className="price">{((expenses + damages + fractions) / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.netProfit}</IonLabel>
            <IonLabel slot="end" className="price">{(netProfit / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.donations}</IonLabel>
            <IonLabel slot="end" className="price">{(donations / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.donationsBalance}</IonLabel>
            <IonLabel slot="end" className="price">{((Math.round(netProfit * 0.2) - donations) / 100).toFixed(2)}</IonLabel>
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
