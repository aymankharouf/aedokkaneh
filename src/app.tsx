import { useEffect } from 'react'
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import firebase from './data/firebase'
import { Advert, Customer, Log, MonthlyOperation, Notification, Order, Pack, PackPrice, PasswordRequest, Product, Purchase, Rating, Spending, Stock as StockType, Store, StoreTrans as StoreTransType } from './data/types'
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
import ProductList from './pages/product-list'
import ProductPackList from './pages/product-pack-list'
import Basket from './pages/basket'
import StoreList from './pages/store-list'
import StorePackList from './pages/store-pack-list'
import StorePackAdd from './pages/store-pack-add'
import ProductAdd from './pages/product-add'
import OrderList from './pages/order-list'
import OrderInfo from './pages/order-info'
import StoreAdd from './pages/store-add'
import ProductEdit from './pages/product-edit'
import CountryList from './pages/country-list'
import CountryAdd from './pages/country-add'
import Settings from './pages/settings'
import CategoryList from './pages/category-list'
import CategoryAdd from './pages/category-add'
import OrderStat from './pages/order-stat'
import PurchaseConfirm from './pages/purchase-confirm'
import PurchaseList from './pages/purchase-list'
import PurchaseInfo from './pages/purchase-info'
import Stock from './pages/stock'
import StockTransList from './pages/stock-trans-list'
import CustomerList from './pages/customer-list'
import PasswordRequestList from './pages/password-request-list'
import PackAdd from './pages/pack-add'
import PackStoreList from './pages/pack-store-list'
import PackEdit from './pages/pack-edit'
import CountryEdit from './pages/country-edit'
import CategoryEdit from './pages/category-edit'
import StoreEdit from './pages/store-edit'
import CustomerInfo from './pages/customer-info'
import CustomerEdit from './pages/customer-edit'
import CustomerApprove from './pages/customer-approve'
import SpendingList from './pages/spending-list'
import SpendingAdd from './pages/spending-add'
import SpendingEdit from './pages/spending-edit'
import MonthlyOperationCall from './pages/monthly-operation-call'
import MonthlyOperationList from './pages/monthly-operation-list'
import PasswordRetreive from './pages/password-retreive'
import OrderEdit from './pages/order-edit'
import PasswordChange from './pages/password-change'
import RegionList from './pages/region-list'
import RegionAdd from './pages/region-add'
import RegionEdit from './pages/region-edit'
import Ratings from './pages/ratings'
import ApprovalList from './pages/approval-list'
import PackStoreAdd from './pages/pack-store-add'
import Logs from './pages/logs'
import StoreInfo from './pages/store-info'
import PrepareOrderList from './pages/prepare-order-list'
import NotificationList from './pages/notification-list'
import NotificationAdd from './pages/notification-add'
import OrderArchived from './pages/order-archived'
import AdvertList from './pages/advert-list'
import AdvertAdd from './pages/advert-add'
import AdvertInfo from './pages/advert-info'
import AdvertEdit from './pages/advert-edit'
import Register from './pages/register'
import PurchaseArchived from './pages/purchase-archived'
import ProductArchived from './pages/product-archived'
import StoreTransList from './pages/store-trans-list'
import PrepareOrderPack from './pages/prepare-order-pack'
import PrepareOrderInfo from './pages/prepare-order-info'
import OrderTransList from './pages/order-trans-list'

const App = () => {
  const dispatch = useDispatch()
  const href = window.location.href
  if (href.length - href.replaceAll('/', '').length !== (href.endsWith('/') ? 3 : 2)) {
    window.location.href = window.location.hostname === 'localhost' ? href.substr(0, 21) : href.substr(0, 28)
  }
  useEffect(() => {
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs: Pack[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          price: doc.data().price,
          unitsCount: doc.data().unitsCount,
          quantityType: doc.data().quantityType,
          isOffer: doc.data().isOffer
        })
      })
      dispatch({type: 'SET_PACKS', payload: packs})
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
              total: doc.data().total,
              deliveryTime: doc.data().deliveryTime,
              deliveryFees: doc.data().deliveryFees,
              fraction: doc.data().fraction,
              profit: doc.data().profit,
              basket: doc.data().basket,
              lastUpdate: doc.data().lastUpdate.toDate(),
              trans: doc.data().trans
            })
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        })  
        const unsubscribeCustomers = firebase.firestore().collection('customers').onSnapshot(docs => {
          const customers: Customer[] = []
          const notifications: Notification[] = []
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
            if (doc.data().ratings) {
              doc.data().ratings.forEach((r: any) => {
                ratings.push({...r, userId: doc.id})
              })
            }
          })
          dispatch({type: 'SET_CUSTOMERS', payload: customers})
          dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          dispatch({type: 'SET_RATINGS', payload: ratings})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          const stores: Store[] = []
          const packPrices: PackPrice[] = []
          const storeTrans: StoreTransType[] = []
          docs.forEach(doc => {
            stores.push({
              id: doc.id,
              name: doc.data().name,
              isActive: doc.data().isActive,
              mobile: doc.data().mobile,
              mapPosition: doc.data().mapPosition,
              openTime: doc.data().openTime,
              address: doc.data().address,
            })
            if (doc.data().prices) {
              doc.data().prices.forEach((p: any) => {
                packPrices.push({
                  storeId: doc.id,
                  packId: p.packId,
                  price: p.price,
                  isActive: p.isActive,
                  lastUpdate: p.lastUpdate.toDate()
                })
              })
            }
            if (doc.data().trans) {
              doc.data().trans.forEach((t: any) => {
                storeTrans.push({
                  storeId: doc.id,
                  packId: t.packId,
                  oldPrice: t.oldPrice,
                  newPrice: t.newPrice,
                  status: t.status,
                  time: t.time.toDate()
                })
              })
            }

          })
          dispatch({type: 'SET_STORES', payload: stores})
          dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
          dispatch({type: 'SET_STORE_TRANS', payload: storeTrans})
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
        const unsubscribeStocks = firebase.firestore().collection('stocks').where('isArchived', '==', false).onSnapshot(docs => {
          const stocks: StockType[] = []
          docs.forEach(doc => {
            stocks.push({
              id: doc.id,
              quantity: doc.data().quantity,
              price: doc.data().price,
              weight: doc.data().weight,
              trans: doc.data().trans
            })
          })
          dispatch({type: 'SET_STOCKS', payload: stocks})
        }, err => {
          unsubscribeStocks()
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
              donations: doc.data().donations,
              damages: doc.data().damages,
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
            <Route path="/password-change" exact={true} component={PasswordChange} />
            <Route path="/register" exact={true} component={Register} />
            <Route path="/product-list/:id" exact={true} component={ProductList} />
            <Route path="/product-pack-list/:id/:type" exact={true} component={ProductPackList} />
            <Route path="/product-edit/:id" exact={true} component={ProductEdit} />
            <Route path="/basket" exact={true} component={Basket} />
            <Route path="/purchase-confirm" exact={true} component={PurchaseConfirm} />
            <Route path="/settings" exact={true} component={Settings} />
            <Route path="/store-list" exact={true} component={StoreList} />
            <Route path="/store-add" exact={true} component={StoreAdd} />
            <Route path="/customer-list" exact={true} component={CustomerList} />
            <Route path="/customer-approve/:id" exact={true} component={CustomerApprove} />
            <Route path="/customer-info/:id" exact={true} component={CustomerInfo} />
            <Route path="/customer-edit/:id" exact={true} component={CustomerEdit} />
            <Route path="/store-info/:id" exact={true} component={StoreInfo} />
            <Route path="/password-request-list" exact={true} component={PasswordRequestList} />
            <Route path="/country-list" exact={true} component={CountryList} />
            <Route path="/country-add" exact={true} component={CountryAdd} />
            <Route path="/country-edit/:id" exact={true} component={CountryEdit} />
            <Route path="/spending-list" exact={true} component={SpendingList} />
            <Route path="/spending-add" exact={true} component={SpendingAdd} />
            <Route path="/spending-edit/:id" exact={true} component={SpendingEdit} />
            <Route path="/category-list/:id" exact={true} component={CategoryList} />
            <Route path="/category-add" exact={true} component={CategoryAdd} />
            <Route path="/category-edit/:id" exact={true} component={CategoryEdit} />
            <Route path="/store-pack-list/:id" exact={true} component={StorePackList} />
            <Route path="/store-edit/:id" exact={true} component={StoreEdit} />
            <Route path="/store-pack-add/:id" exact={true} component={StorePackAdd} />
            <Route path="/pack-store-add/:id" exact={true} component={PackStoreAdd} />
            <Route path="/product-add/:id" exact={true} component={ProductAdd} />
            <Route path="/pack-add/:id" exact={true} component={PackAdd} />
            <Route path="/pack-store-list/:id" exact={true} component={PackStoreList} />
            <Route path="/pack-edit/:id" exact={true} component={PackEdit} />
            <Route path="/order-stat" exact={true} component={OrderStat} />
            <Route path="/order-list/:id/:type" exact={true} component={OrderList} />
            <Route path="/order-info/:id/:type" exact={true} component={OrderInfo} />
            <Route path="/order-edit/:id" exact={true} component={OrderEdit} />
            <Route path="/purchase-list" exact={true} component={PurchaseList} />
            <Route path="/purchase-info/:id/:type" exact={true} component={PurchaseInfo} />
            <Route path="/stock" exact={true} component={Stock} />
            <Route path="/stock-trans-list/:id" exact={true} component={StockTransList} />
            <Route path="/monthly-operation-call" exact={true} component={MonthlyOperationCall} />
            <Route path="/monthly-operation-list/:id" exact={true} component={MonthlyOperationList} />
            <Route path="/password-retreive/:id" exact={true} component={PasswordRetreive} />
            <Route path="/region-list" exact={true} component={RegionList} />
            <Route path="/region-add" exact={true} component={RegionAdd} />
            <Route path="/region-edit/:id" exact={true} component={RegionEdit} />
            <Route path="/ratings" exact={true} component={Ratings} />
            <Route path="/approval-list" exact={true} component={ApprovalList} />
            <Route path="/logs" exact={true} component={Logs} />
            <Route path="/prepare-order-list" exact={true} component={PrepareOrderList} />
            <Route path="/prepare-order-info/:id" exact={true} component={PrepareOrderInfo} />
            <Route path="/prepare-order-pack/:orderId/:packId" exact={true} component={PrepareOrderPack} />
            <Route path="/notification-list" exact={true} component={NotificationList} />
            <Route path="/notification-add" exact={true} component={NotificationAdd} />
            <Route path="/order-archived" exact={true} component={OrderArchived} />
            <Route path="/advert-list" exact={true} component={AdvertList} />
            <Route path="/advert-add" exact={true} component={AdvertAdd} />
            <Route path="/advert-info/:id" exact={true} component={AdvertInfo} />
            <Route path="/advert-edit/:id" exact={true} component={AdvertEdit} />
            <Route path="/purchase-archived" exact={true} component={PurchaseArchived} />
            <Route path="/product-archived" exact={true} component={ProductArchived} />
            <Route path="/store-trans-list/:id" exact={true} component={StoreTransList} />
            <Route path="/order-trans-list/:id" exact={true} component={OrderTransList} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

