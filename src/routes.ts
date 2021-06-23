import Home from './pages/home'
import NotFoundPage from './pages/not-found-page'
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
import StockPackTrans from './pages/stock-pack-trans'
import StockTrans from './pages/stock-trans'
import StockTransDetails from './pages/stock-trans-details'
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
import MonthlyTransCall from './pages/monthly-trans-call'
import MonthlyTrans from './pages/monthly-trans'
import RetreivePassword from './pages/retreive-password'
import StoreOwners from './pages/store-owners'
import EditOrder from './pages/edit-order'
import ChangePassword from './pages/change-password'
import Locations from './pages/locations'
import AddLocation from './pages/add-location'
import EditLocation from './pages/edit-location'
import Ratings from './pages/ratings'
import Approvals from './pages/approvals'
import PackTrans from './pages/pack-trans'
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
import StoreTrans from './pages/store-trans'
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
import ArchivedStockTrans from './pages/archived-stock-trans'
import ArchivedProducts from './pages/archived-products'
import ReturnBasket from './pages/return-basket'
import NotifyFriends from './pages/notify-friends'
import StoreBalance from './pages/store-balance'
import StoreBalanceTrans from './pages/store-balance-trans'

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/home/',
    component: Home,
  },
  {
    path: '/panel/',
    component: Panel
  },
  {
    path: '/login/',
    component: Login,
    options: {
      reloadCurrent: true,
    },
  },
  {
    path: '/panel-login/',
    component: Login,
  },
  {
    path: '/change-password/',
    component: ChangePassword
  },
  {
    path: '/permit-user/:id',
    component: PermitUser
  },
  {
    path: '/register/',
    component: Register,
    options: {
      reloadCurrent: true,
    },
  },
  {
    path: '/products/:id',
    component: Products,
  },
  {
    path: '/product-packs/:id/type/:type',
    component: ProductPacks
  },
  {
    path: '/product-details/:id',
    component: ProductDetails
  },
  {
    path: '/edit-product/:id',
    component: EditProduct
  },
  {
    path: '/basket/',
    component: Basket,
  },
  {
    path: '/confirm-purchase/',
    component: ConfirmPurchase
  },
  {
    path: '/settings/',
    component: Settings
  },
  {
    path: '/stores/',
    component: Stores,
  },
  {
    path: '/add-store/',
    component: AddStore
  },
  {
    path: '/customers/',
    component: Customers,
  },
  {
    path: '/new-users/',
    component: NewUsers
  },
  {
    path: '/approve-user/:id',
    component: ApproveUser
  },
  {
    path: '/customer-details/:id',
    component: CustomerDetails
  },
  {
    path: '/edit-customer/:id',
    component: EditCustomer
  },
  {
    path: '/store-details/:id',
    component: StoreDetails
  },
  {
    path: '/password-requests/',
    component: PasswordRequests
  },
  {
    path: '/alarms/',
    component: Alarms
  },
  {
    path: '/alarm-details/:id/user/:userId',
    component: AlarmDetails
  },
  {
    path: '/offers/',
    component: Offers
  },
  {
    path: '/countries/',
    component: Countries,
  },
  {
    path: '/add-country/',
    component: AddCountry
  },
  {
    path: '/edit-country/:name',
    component: EditCountry
  },
  {
    path: '/spendings/',
    component: Spendings
  },
  {
    path: '/add-spending/',
    component: AddSpending
  },
  {
    path: '/edit-spending/:id',
    component: EditSpending
  },
  {
    path: '/categories/:id',
    component: Categories,
  },
  {
    path: '/add-category/:id',
    component: AddCategory
  },
  {
    path: '/edit-category/:id',
    component: EditCategory
  },
  {
    path: '/store-packs/:id',
    component: StorePacks
  },
  {
    path: '/edit-store/:id',
    component: EditStore
  },
  {
    path: '/add-store-pack/:id',
    component: AddStorePack
  },
  {
    path: '/add-store-payment/:id',
    component: AddStorePayment
  },
  {
    path: '/add-pack-store/:id',
    component: AddPackStore
  },
  {
    path: '/add-product/:id',
    component: AddProduct
  },
  {
    path: '/add-pack/:id',
    component: AddPack
  },
  {
    path: '/add-offer/:id',
    component: AddOffer
  },
  {
    path: '/pack-details/:id',
    component: PackDetails
  },
  {
    path: '/edit-pack/:id',
    component: EditPack
  },
  {
    path: '/edit-offer/:id',
    component: EditOffer
  },
  {
    path: '/edit-price/:packId/store/:storeId',
    component: EditPrice
  },
  {
    path: '/orders/',
    component: Orders,
  },
  {
    path: '/orders-list/:id/type/:type',
    component: OrdersList,
  },
  {
    path: '/order-details/:id/type/:type',
    component: OrderDetails
  },
  {
    path: '/edit-order/:id/type/:type',
    component: EditOrder
  },
  {
    path: '/requested-packs/',
    component: RequestedPacks
  },
  {
    path: '/requested-pack-details/:packId/quantity/:quantity/price/:price/order/:orderId',
    component: RequestedPackDetails
  },
  {
    path: '/purchases/',
    component: Purchases,
  },
  {
    path: '/purchase-details/:id/type/:type',
    component: PurchaseDetails
  },
  {
    path: '/stock/',
    component: Stock,
  },
  {
    path: '/stock-pack-trans/:id',
    component: StockPackTrans
  },
  {
    path: '/stock-trans/',
    component: StockTrans
  },
  {
    path: '/stock-trans-details/:id/type/:type',
    component: StockTransDetails
  },
  {
    path: '/monthly-trans-call/',
    component: MonthlyTransCall,
  },
  {
    path: '/monthly-trans/:id',
    component: MonthlyTrans,
  },
  {
    path: '/retreive-password/:id',
    component: RetreivePassword,
  },
  {
    path: '/store-owners/:id',
    component: StoreOwners,
  },
  {
    path: '/locations/',
    component: Locations
  },
  {
    path: '/add-location/',
    component: AddLocation
  },
  {
    path: '/edit-location/:id',
    component: EditLocation
  },
  {
    path: '/ratings/',
    component: Ratings
  },
  {
    path: '/approvals/',
    component: Approvals
  },
  {
    path: '/pack-trans/:id',
    component: PackTrans
  },
  {
    path: '/order-requests/',
    component: OrderRequests
  },
  {
    path: '/logs/',
    component: Logs
  },
  {
    path: '/prepare-orders/',
    component: PrepareOrders
  },
  {
    path: '/prepare-orders-list/:packId/order/:orderId',
    component: PrepareOrdersList
  },
  {
    path: '/add-bulk/:id',
    component: AddBulk
  },
  {
    path: '/edit-bulk/:id',
    component: EditBulk
  },
  {
    path: '/invitations/',
    component: Invitations
  },
  {
    path: '/invitation-details/:userId/mobile/:mobile',
    component: InvitationDetails
  },
  {
    path: '/notifications/',
    component: Notifications
  },
  {
    path: '/add-notification/',
    component: AddNotification
  },
  {
    path: '/archived-orders/',
    component: ArchivedOrders
  },
  {
    path: '/store-trans/:id',
    component: StoreTrans
  },
  {
    path: '/purchase-plan/',
    component: PurchasePlan
  },
  {
    path: '/purchase-plan-details/:id',
    component: RequestedPacks
  },
  {
    path: '/adverts/',
    component: Adverts
  },
  {
    path: '/add-advert/',
    component: AddAdvert
  },
  {
    path: '/advert-details/:id',
    component: AdvertDetails
  },
  {
    path: '/edit-advert/:id',
    component: EditAdvert
  },
  {
    path: '/order-request-details/:id',
    component: OrderRequestDetails
  },
  {
    path: '/archived-purchases/',
    component: ArchivedPurchases
  },
  {
    path: '/permission-list/:id',
    component: PermissionList
  },
  {
    path: '/archived-stock-trans/',
    component: ArchivedStockTrans
  },
  {
    path: '/archived-products/',
    component: ArchivedProducts
  },
  {
    path: '/return-basket/',
    component: ReturnBasket
  },
  {
    path: '/notify-friends/',
    component: NotifyFriends
  },
  {
    path: '/store-balance/:id',
    component: StoreBalance
  },
  {
    path: '/store-balance-trans/:storeId/month/:month',
    component: StoreBalanceTrans
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
]

export default routes