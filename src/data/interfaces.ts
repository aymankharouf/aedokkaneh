import firebase from './firebase'

export interface iLabel {
    [key: string]: string
}
export interface iCategory {
  id?: string,
  parentId: string,
  name: string,
  ordering: number,
  isLeaf: boolean,
  isActive: boolean
}
export interface iError {
  code: string,
  message: string
}
export interface iPack {
  id?: string,
  name: string,
  productId: string,
  productName: string,
  productAlias: string,
  productDescription: string,
  categoryId: string,
  trademark: string,
  country: string,
  sales: number,
  rating: number,
  ratingCount: number,
  price: number,
  imageUrl: string,
  subPackId: string,
  specialImage: boolean,
  bonusPackId: string,
  isOffer: boolean,
  offerEnd: Date | null,
  closeExpired: boolean,
  forSale: boolean,
  subQuantity: number,
  subPercent: number,
  bonusQuantity: number,
  bonusPercent: number,
  unitsCount: number,
  byWeight: boolean,
  isDivided: boolean
}
export interface iPackPrice {
  packId: string,
  storeId: string,
  quantity: number,
  weight: number,
  price: number,
  cost: number,
  isActive: boolean,
  offerEnd: Date | null,
  time: Date,
  isAuto: boolean
}
export interface iNotification {
  id: string,
  userId: string,
  title: string,
  message: string,
  status: string,
  time: Date
}
export interface iFriend {
  userId: string,
  mobile: string,
  name: string,
  status: string
}
export interface iRating {
}
export interface iAlarm {
}
export interface iUserInfo {
  id: string,
  name: string,
  mobile: string,
  storeName: string,
  colors: string[],
  locationId: string,
  time: Date
}
export interface iCustomerInfo {
  id: string,
  name: string,
  storeId: string,
  storeName: string,
  orderLimit: number,
  isBlocked: boolean,
  address: string,
  deliveryFees: number,
  specialDiscount: number,
  discounts: number,
  mapPosition: string,
  ordersCount: number,
  deliveredOrdersCount: number,
  returnedCount: number,
  deliveredOrdersTotal: number,
  time: Date
}
export interface iOrderBasketPack {
  packId: string,
  storeId: string,
  price: number,
  cost: number,
  actual: number,
  quantity: number,
  weight: number,
  purchased: number,
  gross: number,
  status: string,
  lastPurchaseId: string,
  lastPurchased: number,
  lastWeight: number,
  prevStoreId: string
}
export interface iOrder {
  id?: string,
  userId: string,
  status: string,
  time: Date,
  basket: iOrderBasketPack[]
}
export interface iAdvert {
  id?: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl: string,
  time: Date
}
export interface iLocation {
  id: string,
  name: string,
  fees: number,
  ordering: number
}
export interface iPasswordRequest {
  id: string,
  mobile: string,
  status: string,
  time: Date
}
export interface iBalance {
  month: number,
  balance: number
}
export interface iStore {
  id?: string,
  name: string,
  type: string,
  isActive: boolean,
  allowReturn: boolean,
  discount: number,
  mobile: string,
  mapPosition: string,
  openTime: string,
  address: string,
  time: Date,
  balances: iBalance[]
}
export interface iPurchase {
  id?: string,
  storeId: string,
  total: number,
  time: Date,
  isArchived: boolean,
  basket: iStockPack[]
}
export interface iStockTrans {
  id?: string,
  purchaseId: string,
  basket: iStockPack[]
}
export interface iProduct {
  id?: string,
  name: string,
  alias: string,
  description: string,
  trademark: string,
  country: string,
  categoryId: string,
  imageUrl: string,
  sales: number,
  rating: number,
  ratingCount: number,
  isArchived: boolean
}
export interface iSpending {
  id?: string,
  type: string,
  amount: number,
  spendingDate: Date,
  description: string,
  time: Date
}
export interface iMonthlyTrans {

}
export interface iLog {
  id: string,
  userId: string,
  page: string,
  error: string,
  time: Date
}
export interface iStorePayment {
  
}
export interface iBasket {
  storeId: string,
  packs: iBasketPack[]
}
export interface iReturnBasket {
  storeId: string,
  purchaseId: string,
  type: string,
  packs: iStockPack[]
}
export interface iBasketPack {
  packId: string,
  productName: string,
  productAlias: string,
  packName: string,
  imageUrl: string,
  price: number,
  actual: number,
  cost: number,
  quantity: number,
  weight: number,
  requested: number,
  orderId: string,
  isOffer: boolean,
  isDivided: boolean,
  closeExpired: boolean,
  exceedPriceType: string,
  refPackId: string,
  refPackQuantity: number
}
export interface iStockPack {
  packId: string,
  quantity: number,
  cost: number,
  price: number,
  actual: number,
  weight: number
}
export interface iState {
  user?: firebase.User,
  categories: iCategory[], 
  locations: iLocation[], 
  countries: string[],
  stores: iStore[], 
  users: iUserInfo[],
  purchases: iPurchase[],
  orders: iOrder[],
  stockTrans: iStockTrans[],
  products: iProduct[],
  packs: iPack[],
  passwordRequests: iPasswordRequest[],
  customers: iCustomerInfo[],
  spendings: iSpending[],
  monthlyTrans: iMonthlyTrans[],
  packPrices: iPackPrice[],
  logs: iLog[],
  archivedOrders: iOrder[],
  adverts: iAdvert[],
  archivedPurchases: iPurchase[],
  archivedStockTrans: iStockTrans[],
  archivedProducts: iProduct[],
  archivedPacks: iPack[],
  notifications: iNotification[],
  alarms: iAlarm[],
  ratings: iRating[],
  invitations: iFriend[],
  storePayments: iStorePayment[],
  basket?: iBasket,
  returnBasket?: iReturnBasket
}

export interface iAction {
  type: string
  payload?: any
}

export interface iContext {
  state: iState;
  dispatch: React.Dispatch<iAction>
}