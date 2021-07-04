import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import StateProvider from './data/state-provider'


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
import NewUsers from './pages/new-users'
import ApproveUser from './pages/approve-user'
import Alarms from './pages/alarms'
import AlarmDetails from './pages/alarm-details'
import Offers from './pages/offers'
import Spendings from './pages/spendings'
import AddSpending from './pages/add-spending'
import EditSpending from './pages/edit-spending'
import MonthlyOperationCall from './pages/monthly-operation-call'
import MonthlyOperations from './pages/monthly-operations'
import RetreivePassword from './pages/retreive-password'
import StoreOwners from './pages/store-owners'
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
import AddBulk from './pages/add-bulk'
import EditBulk from './pages/edit-bulk'
import Invitations from './pages/invitations'
import InvitationDetails from './pages/invitation-details'
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
import PermitUser from './pages/permit-user'
import Register from './pages/register'
import ArchivedPurchases from './pages/archived-purchases'
import PermissionList from './pages/permission-list'
import ArchivedStockOperations from './pages/archived-stock-operations'
import ArchivedProducts from './pages/archived-products'
import ReturnBasket from './pages/return-basket'
import StoreBalance from './pages/store-balance'
import StoreBalanceOperations from './pages/store-balance-operations'


const app = () => {
  const href = window.location.href
  if (href.length - href.replaceAll('/', '').length !== (href.endsWith('/') ? 3 : 2)) {
    window.location.href = window.location.hostname === 'localhost' ? href.substr(0, 21) : href.substr(0, 28)
  }
  return (
    <StateProvider>
      <IonApp dir="rtl">
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Panel />
            <IonRouterOutlet id="main" mode="ios">
              <Route path="/" exact={true} component={Home} />
              <Route path="/login" exact={true} component={Login} />
              <Route path="/change-password" exact={true} component={ChangePassword} />
              <Route path="/permit-user/:id" exact={true} component={PermitUser} />
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
              <Route path="/new-users" exact={true} component={NewUsers} />
              <Route path="/approve-user/:id" exact={true} component={ApproveUser} />
              <Route path="/customer-details/:id" exact={true} component={CustomerDetails} />
              <Route path="/edit-customer/:id" exact={true} component={EditCustomer} />
              <Route path="/store-details/:id" exact={true} component={StoreDetails} />
              <Route path="/password-requests" exact={true} component={PasswordRequests} />
              <Route path="/alarms" exact={true} component={Alarms} />
              <Route path="/alarm-details/:id/:userId" exact={true} component={AlarmDetails} />
              <Route path="/offers" exact={true} component={Offers} />
              <Route path="/countries" exact={true} component={Countries} />
              <Route path="/add-country" exact={true} component={AddCountry} />
              <Route path="/edit-country/:name" exact={true} component={EditCountry} />
              <Route path="/spendings" exact={true} component={Spendings} />
              <Route path="/add-spending" exact={true} component={AddSpending} />
              <Route path="/edit-spending/:id" exact={true} component={EditSpending} />
              <Route path="/categories/:id" exact={true} component={Categories} />
              <Route path="/add-category/:id" exact={true} component={AddCategory} />
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
              <Route path="/store-owners/:id" exact={true} component={StoreOwners} />
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
              <Route path="/add-bulk/:id" exact={true} component={AddBulk} />
              <Route path="/edit-bulk/:id" exact={true} component={EditBulk} />
              <Route path="/invitations" exact={true} component={Invitations} />
              <Route path="/invitation-details/:userId/:mobile" exact={true} component={InvitationDetails} />
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
              <Route path="/permission-list/:id" exact={true} component={PermissionList} />
              <Route path="/archived-stock-operations" exact={true} component={ArchivedStockOperations} />
              <Route path="/archived-products" exact={true} component={ArchivedProducts} />
              <Route path="/return-basket" exact={true} component={ReturnBasket} />
              <Route path="/store-balance/:id" exact={true} component={StoreBalance} />
              <Route path="/store-balance-operations/:storeId/:month" exact={true} component={StoreBalanceOperations} />
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    </StateProvider>
  );
};

export default app;

