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
import Products from './pages/products-list'
import ProductPacks from './pages/product-packs'
import Basket from './pages/basket'
import Stores from './pages/stores-list'
import StorePacks from './pages/store-packs'
import AddStorePack from './pages/store-packs-add'
import AddProduct from './pages/products-add'
import OrdersList from './pages/orders-list'
import OrderDetails from './pages/order-details'
import AddStore from './pages/stores-add'
import EditProduct from './pages/products-edit'
import EditPrice from './pages/edit-price'
import Countries from './pages/countries-list'
import AddCountry from './pages/countries-add'
import Settings from './pages/settings'
import Categories from './pages/categories-list'
import AddCategory from './pages/categories-add'
import Orders from './pages/orders-stat'
import ConfirmPurchase from './pages/confirm-purchase'
import Purchases from './pages/purchases-list'
import PurchaseDetails from './pages/purchase-details'
import Stock from './pages/stock'
import StockTrans from './pages/stock-trans'
import Customers from './pages/customers-list'
import PasswordRequests from './pages/password-requests'
import AddPack from './pages/packs-add'
import PackDetails from './pages/pack-stores-list'
import EditPack from './pages/packs-edit'
import EditCountry from './pages/countries-edit'
import EditCategory from './pages/categories-edit'
import EditStore from './pages/stores-edit'
import CustomerDetails from './pages/customer-details'
import EditCustomer from './pages/customers-edit'
import ApproveCustomer from './pages/approve-customer'
import Spendings from './pages/spendings-list'
import AddSpending from './pages/spendings-add'
import EditSpending from './pages/edit-spending'
import MonthlyOperationCall from './pages/monthly-operation-call'
import MonthlyOperations from './pages/monthly-operations'
import RetreivePassword from './pages/retreive-password'
import EditOrder from './pages/orders-edit'
import ChangePassword from './pages/change-password'
import Regions from './pages/regions-list'
import AddRegion from './pages/regions-add'
import EditRegion from './pages/regions-edit'
import Ratings from './pages/ratings'
import Approvals from './pages/approvals'
import PackOperations from './pages/pack-operations'
import AddPackStore from './pages/pack-stores-add'
import Logs from './pages/logs'
import StoreDetails from './pages/store-details'
import PrepareOrdersList from './pages/prepare-orders-list'
import ProductDetails from './pages/product-details'
import AddOffer from './pages/pack-offers-add'
import EditOffer from './pages/pack-offers-edit'
import Notifications from './pages/notifications-list'
import AddNotification from './pages/notifications-add'
import ArchivedOrders from './pages/archived-orders'
import Adverts from './pages/adverts-list'
import AddAdvert from './pages/adverts-add'
import AdvertDetails from './pages/advert-details'
import EditAdvert from './pages/adverts-edit'
import Register from './pages/register'
import ArchivedPurchases from './pages/archived-purchases'
import ArchivedProducts from './pages/archived-products'
import StoreTrans from './pages/store-trans'
import OrderPackStores from './pages/prepare-order-pack'
import PrepareOrderPack from './pages/prepare-order-pack'
import PrepareOrder from './pages/prepare-order'
import OrderTrans from './pages/order-trans'

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
          subCount: doc.data().subCount,
          unitsCount: doc.data().unitsCount,
          quantityType: doc.data().quantityType,
          gift: doc.data().gift
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({
              packId: doc.id,
              storeId: p.storeId,
              price: p.price,
              isActive: p.isActive,
            })
          })
        }
      })
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
          let stores: Store[] = []
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
          })
          dispatch({type: 'SET_STORES', payload: stores})
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
        const unsubscribeStoreTrans = firebase.firestore().collection('store-trans').onSnapshot(docs => {
          let storeTrans: StoreTransType[] = []
          docs.forEach(doc => {
            storeTrans.push({
              id: doc.id,
              storeId: doc.data().storeId,
              packId: doc.data().packId,
              oldPrice: doc.data().oldPrice,
              newPrice: doc.data().newPrice,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_STORE_TRANS', payload: storeTrans})
        }, err => {
          unsubscribeStoreTrans()
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
            <Route path="/approve-customer/:id" exact={true} component={ApproveCustomer} />
            <Route path="/customer-details/:id" exact={true} component={CustomerDetails} />
            <Route path="/edit-customer/:id" exact={true} component={EditCustomer} />
            <Route path="/store-details/:id" exact={true} component={StoreDetails} />
            <Route path="/password-requests" exact={true} component={PasswordRequests} />
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
            <Route path="/edit-order/:id" exact={true} component={EditOrder} />
            <Route path="/order-pack-stores/:packId/:quantity/:price" exact={true} component={OrderPackStores} />
            <Route path="/purchases" exact={true} component={Purchases} />
            <Route path="/purchase-details/:id/:type" exact={true} component={PurchaseDetails} />
            <Route path="/stock" exact={true} component={Stock} />
            <Route path="/stock-trans/:id" exact={true} component={StockTrans} />
            <Route path="/monthly-operation-call" exact={true} component={MonthlyOperationCall} />
            <Route path="/monthly-operations/:id" exact={true} component={MonthlyOperations} />
            <Route path="/retreive-password/:id" exact={true} component={RetreivePassword} />
            <Route path="/regions" exact={true} component={Regions} />
            <Route path="/add-region" exact={true} component={AddRegion} />
            <Route path="/edit-region/:id" exact={true} component={EditRegion} />
            <Route path="/ratings" exact={true} component={Ratings} />
            <Route path="/approvals" exact={true} component={Approvals} />
            <Route path="/pack-operations/:id" exact={true} component={PackOperations} />
            <Route path="/logs" exact={true} component={Logs} />
            <Route path="/prepare-orders-list" exact={true} component={PrepareOrdersList} />
            <Route path="/prepare-order/:id" exact={true} component={PrepareOrder} />
            <Route path="/prepare-order-pack/:orderId/:packId" exact={true} component={PrepareOrderPack} />
            <Route path="/notifications" exact={true} component={Notifications} />
            <Route path="/add-notification" exact={true} component={AddNotification} />
            <Route path="/archived-orders" exact={true} component={ArchivedOrders} />
            <Route path="/adverts" exact={true} component={Adverts} />
            <Route path="/add-advert" exact={true} component={AddAdvert} />
            <Route path="/advert-details/:id" exact={true} component={AdvertDetails} />
            <Route path="/edit-advert/:id" exact={true} component={EditAdvert} />
            <Route path="/archived-purchases" exact={true} component={ArchivedPurchases} />
            <Route path="/archived-products" exact={true} component={ArchivedProducts} />
            <Route path="/store-trans/:id" exact={true} component={StoreTrans} />
            <Route path="/order-trans/:id" exact={true} component={OrderTrans} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

