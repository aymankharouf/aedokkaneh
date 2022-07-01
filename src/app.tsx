import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import firebase from './data/firebase'
import { Advert, Alarm, Customer, Log, MonthlyOperation, Notification, Order, Pack, PackPrice, PasswordRequest, Product, Purchase, Rating, Spending, StockOperation, Store, StorePayment } from './data/types'
import { useDispatch } from 'react-redux';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './css/variables.css'
import './css/app.css'

import Home from './pages/home'
import Panel from './pages/panel'
import Login from './pages/login'
import Products from './pages/products'
import ProductPacks from './pages/product-packs'
import Basket from './pages/basket'
import Stores from './pages/stores'
import StorePacks from './pages/store-packs'
import AddStorePack from './pages/add-store-pack'
import AddStorePayment from './pages/add-store-payment'
import AddProduct from './pages/add-product'
import OrdersList from './pages/orders-list'
import OrderDetails from './pages/order-details'
import AddStore from './pages/add-store'
import EditProduct from './pages/edit-product'
import EditPrice from './pages/edit-price'
import Countries from './pages/countries'
import AddCountry from './pages/add-country'
import Settings from './pages/settings'
import Categories from './pages/categories'
import AddCategory from './pages/add-category'
import Orders from './pages/orders'
import RequestedPacks from './pages/requested-packs'
import RequestedPackDetails from './pages/requested-pack-details'
import ConfirmPurchase from './pages/confirm-purchase'
import Purchases from './pages/purchases'
import PurchaseDetails from './pages/purchase-details'
import Stock from './pages/stock'
import StockPackOperations from './pages/stock-pack-operations'
import StockOperations from './pages/stock-operations'
import StockOperationDetails from './pages/stock-operation-details'
import Customers from './pages/customers'
import PasswordRequests from './pages/password-requests'
import AddPack from './pages/add-pack'
import PackDetails from './pages/pack-details'
import EditPack from './pages/edit-pack'
import EditCountry from './pages/edit-country'
import EditCategory from './pages/edit-category'
import EditStore from './pages/edit-store'
import CustomerDetails from './pages/customer-details'
import EditCustomer from './pages/edit-customer'
import NewCustomers from './pages/new-customers'
import ApproveCustomer from './pages/approve-customer'
import Alarms from './pages/alarms'
import AlarmDetails from './pages/alarm-details'
import Spendings from './pages/spendings'
import AddSpending from './pages/add-spending'
import EditSpending from './pages/edit-spending'
import MonthlyOperationCall from './pages/monthly-operation-call'
import MonthlyOperations from './pages/monthly-operations'
import RetreivePassword from './pages/retreive-password'
import EditOrder from './pages/edit-order'
import ChangePassword from './pages/change-password'
import Regions from './pages/regions'
import AddRegion from './pages/add-region'
import EditRegion from './pages/edit-region'
import Ratings from './pages/ratings'
import Approvals from './pages/approvals'
import PackOperations from './pages/pack-operations'
import AddPackStore from './pages/add-pack-store'
import OrderRequests from './pages/order-requests'
import Logs from './pages/logs'
import StoreDetails from './pages/store-details'
import PrepareOrders from './pages/prepare-orders'
import PrepareOrdersList from './pages/prepare-orders-list'
import ProductDetails from './pages/product-details'
import AddOffer from './pages/add-offer'
import EditOffer from './pages/edit-offer'
import Notifications from './pages/notifications'
import AddNotification from './pages/add-notification'
import ArchivedOrders from './pages/archived-orders'
import StoreOperations from './pages/store-operations'
import PurchasePlan from './pages/purchase-plan'
import Adverts from './pages/adverts'
import AddAdvert from './pages/add-advert'
import AdvertDetails from './pages/advert-details'
import EditAdvert from './pages/edit-advert'
import OrderRequestDetails from './pages/order-request-details'
import Register from './pages/register'
import ArchivedPurchases from './pages/archived-purchases'
import ArchivedStockOperations from './pages/archived-stock-operations'
import ArchivedProducts from './pages/archived-products'
import ReturnBasket from './pages/return-basket'
import StoreBalance from './pages/store-balance'
import StoreBalanceOperations from './pages/store-balance-operations'
import { useEffect } from 'react'

const App = () => {
  const dispatch = useDispatch()
  const href = window.location.href
  if (href.length - href.replaceAll('/', '').length !== (href.endsWith('/') ? 3 : 2)) {
    window.location.href = window.location.hostname === 'localhost' ? href.substr(0, 21) : href.substr(0, 28)
  }
  useEffect(() => {
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs: Pack[] = []
      let packPrices: PackPrice[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          price: doc.data().price,
          subPackId: doc.data().subPackId,
          isOffer: doc.data().isOffer,
          subCount: doc.data().subCount,
          unitsCount: doc.data().unitsCount,
          byWeight: doc.data().byWeight,
          isDivided: doc.data().isDivided,
          withGift: doc.data().withGift,
          gift: doc.data().gift
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({
              packId: doc.id,
              storeId: p.storeId,
              quantity: p.quantity,
              weight: p.weight,
              price: p.price,
              isActive: p.isActive,
              time: p.time.toDate()
            })
          })
        }
      })
      console.log('packs .... ', packs)
      dispatch({type: 'SET_PACKS', payload: packs})
      dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
    }, err => {
      unsubscribePacks()
    })
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests: PasswordRequest[] = []
      docs.forEach(doc => {
        passwordRequests.push({
          id: doc.id,
          mobile: doc.data().mobile,
          status: doc.data().status,
          time: doc.data().time.toDate()
        })
      })
      dispatch({type: 'SET_PASSWORD_REQUESTS', payload: passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
    })
    const unsubscribeAdverts = firebase.firestore().collection('adverts').onSnapshot(docs => {
      let adverts: Advert[] = []
      docs.forEach(doc => {
        adverts.push({
          id: doc.id,
          type: doc.data().type,
          title: doc.data().title,
          text: doc.data().text,
          imageUrl: doc.data().imageUrl,
          isActive: doc.data().isActive,
          time: doc.data().time.toDate()
        })
      })
      dispatch({type: 'SET_ADVERTS', payload: adverts})
    }, err => {
      unsubscribeAdverts()
    }) 
    firebase.auth().onAuthStateChanged(user => {
      if (user){
        dispatch({type: 'LOGIN', payload: user})
        const unsubscribeRegions = firebase.firestore().collection('lookups').doc('r').onSnapshot(doc => {
          if (doc.exists) dispatch({type: 'SET_REGIONS', payload: doc.data()?.values})
        }, err => {
          unsubscribeRegions()
        })  
        const unsubscribeCountries = firebase.firestore().collection('lookups').doc('c').onSnapshot(doc => {
          if (doc.exists) dispatch({type: 'SET_COUNTRIES', payload: doc.data()?.values})
        }, err => {
          unsubscribeCountries()
        })
        const unsubscribeCategories = firebase.firestore().collection('lookups').doc('g').onSnapshot(doc => {
          if (doc.exists) dispatch({type: 'SET_CATEGORIES', payload: doc.data()?.values})
        }, err => {
          unsubscribeCategories()
        })
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products: Product[] = []
          docs.forEach(doc => {
            products.push({
              id: doc.id,
              name: doc.data().name,
              alias: doc.data().alias,
              description: doc.data().description,
              trademark: doc.data().trademark,
              countryId: doc.data().countryId,
              categoryId: doc.data().categoryId,
              imageUrl: doc.data().imageUrl,
              sales: doc.data().sales,
              rating: doc.data().rating,
              ratingCount: doc.data().ratingCount,
              isArchived: doc.data().isArchived
            })
          })
          dispatch({type: 'SET_PRODUCTS', payload: products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeOrders = firebase.firestore().collection('orders').where('isArchived', '==', false).onSnapshot(docs => {
          let orders: Order[] = []
          docs.forEach(doc => {
            orders.push({
              id: doc.id,
              userId: doc.data().userId,
              status: doc.data().status,
              requestType: doc.data().requestType,
              total: doc.data().total,
              deliveryTime: doc.data().deliveryTime,
              deliveryFees: doc.data().deliveryFees,
              fraction: doc.data().fraction,
              profit: doc.data().profit,
              lastUpdate: doc.data().lastUpdate?.toDate() || null,
              requestTime: doc.data().requestTime?.toDate() || null,
              basket: doc.data().basket,
              requestBasket: doc.data().requestBasket,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        })  
        const unsubscribeCustomers = firebase.firestore().collection('customers').onSnapshot(docs => {
          const customers: Customer[] = []
          const notifications: Notification[] = []
          const alarms: Alarm[] = []
          const ratings: Rating[] = []
          docs.forEach(doc => {
            customers.push({
              id: doc.id,
              name: doc.data().name,
              mobile: doc.data().mobile,
              storeId: doc.data().storeId,
              colors: doc.data().colors,
              regionId: doc.data().regionId,
              status: doc.data().status,
              orderLimit: doc.data().orderLimit,
              address: doc.data().address,
              deliveryFees: doc.data().deliveryFees,
              mapPosition: doc.data().mapPosition,
              ordersCount: doc.data().ordersCount,
              deliveredOrdersCount: doc.data().deliveredOrdersCount,
              returnedCount: doc.data().returnedCount,
              deliveredOrdersTotal: doc.data().deliveredOrdersTotal,
              time: doc.data().time.toDate()
            })
            if (doc.data().notifications) {
              doc.data().notifications.forEach((n: any) => {
                notifications.push({
                  userId: doc.id,
                  id: n.id,
                  title: n.title,
                  text: n.text,
                  status: n.status,
                  time: n.time.toDate()
                })
              })
            }
            if (doc.data().alarms) {
              doc.data().alarms.forEach((a: any) => {
                alarms.push({
                  userId: doc.id,
                  id: a.id,
                  packId: a.packId,
                  storeId: a.storeId,
                  newPackId: a.newPackId,
                  type: a.type,
                  status: a.status,
                  offerDays: a.offerDays,
                  price: a.price,
                  alternative: a.alternative,
                  quantity: a.quantity,
                  time: a.time.toDate()
                })
              })
            }
            if (doc.data().ratings) {
              doc.data().ratings.forEach((r: any) => {
                ratings.push({...r, userId: doc.id})
              })
            }
          })
          dispatch({type: 'SET_CUSTOMERS', payload: customers})
          dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          dispatch({type: 'SET_ALARMS', payload: alarms})
          dispatch({type: 'SET_RATINGS', payload: ratings})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: Store[] = []
          let storePayments: StorePayment[] = []
          docs.forEach(doc => {
            stores.push({
              id: doc.id,
              name: doc.data().name,
              isActive: doc.data().isActive,
              mobile: doc.data().mobile,
              mapPosition: doc.data().mapPosition,
              openTime: doc.data().openTime,
              address: doc.data().address,
              time: doc.data().time.toDate(),
              balances: doc.data().balances
            })
            if (doc.data().payments) {
              doc.data().payments.forEach((p: any) => {
                storePayments.push({...p, storeId: doc.id, storeInfo: doc.data()})
              })
            }
          })
          dispatch({type: 'SET_STORES', payload: stores})
          dispatch({type: 'SET_STORE_PAYMENTS', payload: storePayments})
        }, err => {
          unsubscribeStores()
        })  
        const unsubscribePurchases = firebase.firestore().collection('purchases').where('isArchived', '==', false).onSnapshot(docs => {
          let purchases: Purchase[] = []
          docs.forEach(doc => {
            purchases.push({
              id: doc.id,
              storeId: doc.data().storeId,
              total: doc.data().total,
              time: doc.data().time.toDate(),
              isArchived: doc.data().isArchived,
              basket: doc.data().basket
            })
          })
          dispatch({type: 'SET_PURCHASES', payload: purchases})
        }, err => {
          unsubscribePurchases()
        })  
        const unsubscribeStockOperations = firebase.firestore().collection('stock-operations').where('isArchived', '==', false).onSnapshot(docs => {
          const stockOperations: StockOperation[] = []
          docs.forEach(doc => {
            stockOperations.push({
              id: doc.id,
              purchaseId: doc.data().purchaseId,
              type: doc.data().type,
              total: doc.data().total,
              storeId: doc.data().storeId,
              time: doc.data().time.toDate(),
              basket: doc.data().basket
            })
          })
          dispatch({type: 'SET_STOCK_OPERATIONS', payload: stockOperations})
        }, err => {
          unsubscribeStockOperations()
        })  
        const unsubscribeSpendings = firebase.firestore().collection('spendings').onSnapshot(docs => {
          let spendings: Spending[] = []
          docs.forEach(doc => {
            spendings.push({
              id: doc.id,
              type: doc.data().type,
              amount: doc.data().amount,
              spendingDate: doc.data().spendingDate.toDate(),
              description: doc.data().description,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_SPENDINGS', payload: spendings})
        }, err => {
          unsubscribeSpendings()
        })  
        const unsubscribeMonthlyOperations = firebase.firestore().collection('monthly-operations').onSnapshot(docs => {
          let monthlyOperations: MonthlyOperation[] = []
          docs.forEach(doc => {
            monthlyOperations.push({
              id: doc.data().id,
              ordersCount: doc.data().ordersCount,
              deliveredOrdersCount: doc.data().deliveredOrdersCount,
              finishedOrdersCount: doc.data().finishedOrdersCount,
              stock: doc.data().stock,
              sales: doc.data().sales,
              operationProfit: doc.data().operationProfit,
              deliveryFees: doc.data().deliveryFees,
              fractions: doc.data().fractions,
              storesBalance: doc.data().storesBalance,
              donations: doc.data().donations,
              damages: doc.data().damages,
              storesProfit: doc.data().storesProfit,
              operationNet: doc.data().operationNet,
              withdrawals: doc.data().withdrawals,
              expenses: doc.data().expenses,
              netProfit: doc.data().netProfit
            })
          })
          dispatch({type: 'SET_MONTHLY_OPERATIONS', payload: monthlyOperations})
        }, err => {
          unsubscribeMonthlyOperations()
        })  
        const unsubscribeLogs = firebase.firestore().collection('logs').onSnapshot(docs => {
          let logs: Log[] = []
          docs.forEach(doc => {
            logs.push({
              id: doc.id,
              userId: doc.data().userId,
              page: doc.data().page,
              error: doc.data().error,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_LOGS', payload: logs})
        }, err => {
          unsubscribeLogs()
        })  
      } else {
        dispatch({type: 'LOGOUT'})
      }
    })
  }, [dispatch])

  return (
    <IonApp dir="rtl">
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Panel />
          <IonRouterOutlet id="main" mode="ios">
            <Route path="/" exact={true} component={Home} />
            <Route path="/login" exact={true} component={Login} />
            <Route path="/change-password" exact={true} component={ChangePassword} />
            <Route path="/register" exact={true} component={Register} />
            <Route path="/products/:id" exact={true} component={Products} />
            <Route path="/product-packs/:id/:type" exact={true} component={ProductPacks} />
            <Route path="/product-details/:id" exact={true} component={ProductDetails} />
            <Route path="/edit-product/:id" exact={true} component={EditProduct} />
            <Route path="/basket" exact={true} component={Basket} />
            <Route path="/confirm-purchase" exact={true} component={ConfirmPurchase} />
            <Route path="/settings" exact={true} component={Settings} />
            <Route path="/stores" exact={true} component={Stores} />
            <Route path="/add-store" exact={true} component={AddStore} />
            <Route path="/customers" exact={true} component={Customers} />
            <Route path="/new-customers" exact={true} component={NewCustomers} />
            <Route path="/approve-customer/:id" exact={true} component={ApproveCustomer} />
            <Route path="/customer-details/:id" exact={true} component={CustomerDetails} />
            <Route path="/edit-customer/:id" exact={true} component={EditCustomer} />
            <Route path="/store-details/:id" exact={true} component={StoreDetails} />
            <Route path="/password-requests" exact={true} component={PasswordRequests} />
            <Route path="/alarms" exact={true} component={Alarms} />
            <Route path="/alarm-details/:id/:userId" exact={true} component={AlarmDetails} />
            <Route path="/countries" exact={true} component={Countries} />
            <Route path="/add-country" exact={true} component={AddCountry} />
            <Route path="/edit-country/:id" exact={true} component={EditCountry} />
            <Route path="/spendings" exact={true} component={Spendings} />
            <Route path="/add-spending" exact={true} component={AddSpending} />
            <Route path="/edit-spending/:id" exact={true} component={EditSpending} />
            <Route path="/categories/:id" exact={true} component={Categories} />
            <Route path="/add-category" exact={true} component={AddCategory} />
            <Route path="/edit-category/:id" exact={true} component={EditCategory} />
            <Route path="/store-packs/:id" exact={true} component={StorePacks} />
            <Route path="/edit-store/:id" exact={true} component={EditStore} />
            <Route path="/add-store-pack/:id" exact={true} component={AddStorePack} />
            <Route path="/add-store-payment/:id" exact={true} component={AddStorePayment} />
            <Route path="/add-pack-store/:id" exact={true} component={AddPackStore} />
            <Route path="/add-product/:id" exact={true} component={AddProduct} />
            <Route path="/add-pack/:id" exact={true} component={AddPack} />
            <Route path="/add-offer/:id" exact={true} component={AddOffer} />
            <Route path="/pack-details/:id" exact={true} component={PackDetails} />
            <Route path="/edit-pack/:id" exact={true} component={EditPack} />
            <Route path="/edit-offer/:id" exact={true} component={EditOffer} />
            <Route path="/edit-price/:packId/:storeId" exact={true} component={EditPrice} />
            <Route path="/orders" exact={true} component={Orders} />
            <Route path="/orders-list/:id/:type" exact={true} component={OrdersList} />
            <Route path="/order-details/:id/:type" exact={true} component={OrderDetails} />
            <Route path="/edit-order/:id/:type" exact={true} component={EditOrder} />
            <Route path="/requested-packs" exact={true} component={RequestedPacks} />
            <Route path="/requested-pack-details/:packId/:quantity/:price/:orderId" exact={true} component={RequestedPackDetails} />
            <Route path="/purchases" exact={true} component={Purchases} />
            <Route path="/purchase-details/:id/:type" exact={true} component={PurchaseDetails} />
            <Route path="/stock" exact={true} component={Stock} />
            <Route path="/stock-pack-operations/:id" exact={true} component={StockPackOperations} />
            <Route path="/stock-operations" exact={true} component={StockOperations} />
            <Route path="/stock-operation-details/:id/:type" exact={true} component={StockOperationDetails} />
            <Route path="/monthly-operation-call" exact={true} component={MonthlyOperationCall} />
            <Route path="/monthly-operations/:id" exact={true} component={MonthlyOperations} />
            <Route path="/retreive-password/:id" exact={true} component={RetreivePassword} />
            <Route path="/regions" exact={true} component={Regions} />
            <Route path="/add-region" exact={true} component={AddRegion} />
            <Route path="/edit-region/:id" exact={true} component={EditRegion} />
            <Route path="/ratings" exact={true} component={Ratings} />
            <Route path="/approvals" exact={true} component={Approvals} />
            <Route path="/pack-operations/:id" exact={true} component={PackOperations} />
            <Route path="/order-requests" exact={true} component={OrderRequests} />
            <Route path="/logs" exact={true} component={Logs} />
            <Route path="/prepare-orders" exact={true} component={PrepareOrders} />
            <Route path="/prepare-orders-list/:packId/:orderId" exact={true} component={PrepareOrdersList} />
            <Route path="/notifications" exact={true} component={Notifications} />
            <Route path="/add-notification" exact={true} component={AddNotification} />
            <Route path="/archived-orders" exact={true} component={ArchivedOrders} />
            <Route path="/store-operations/:id" exact={true} component={StoreOperations} />
            <Route path="/purchase-plan" exact={true} component={PurchasePlan} />
            <Route path="/purchase-plan-details/:id" exact={true} component={PurchaseDetails} />
            <Route path="/adverts" exact={true} component={Adverts} />
            <Route path="/add-advert" exact={true} component={AddAdvert} />
            <Route path="/advert-details/:id" exact={true} component={AdvertDetails} />
            <Route path="/edit-advert/:id" exact={true} component={EditAdvert} />
            <Route path="/order-request-details/:id" exact={true} component={OrderRequestDetails} />
            <Route path="/archived-purchases" exact={true} component={ArchivedPurchases} />
            <Route path="/archived-stock-operations" exact={true} component={ArchivedStockOperations} />
            <Route path="/archived-products" exact={true} component={ArchivedProducts} />
            <Route path="/return-basket" exact={true} component={ReturnBasket} />
            <Route path="/store-balance/:id" exact={true} component={StoreBalance} />
            <Route path="/store-balance-operations/:storeId/:month" exact={true} component={StoreBalanceOperations} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

