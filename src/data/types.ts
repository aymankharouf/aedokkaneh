import firebase from './firebase'

export type Label = {
    [key: string]: string
}
export type Category = {
  id: string,
  name: string,
  ordering: number,
  parentId?: string,
  level: number
}
export type Err = {
  code: string,
  message: string
}
export type Pack = {
  id?: string,
  name: string,
  productId: string,
  productName: string,
  productAlias: string,
  productDescription: string,
  categoryId: string,
  trademark: string,
  countryId: string,
  sales: number,
  rating: number,
  ratingCount: number,
  price: number,
  imageUrl: string,
  subPackId?: string,
  subQuantity?: number,
  subPackName?: string,
  specialImage: boolean,
  isOffer: boolean,
  offerEnd: Date | null,
  closeExpired: boolean,
  withGift: boolean,
  gift?: string
  unitsCount: number,
  byWeight: boolean,
  isDivided: boolean
}
export type PackPrice = {
  packId: string,
  storeId: string,
  quantity: number,
  weight: number,
  price: number,
  isActive: boolean,
  offerEnd: Date | null,
  time: Date
}
export type Notification = {
  id: string,
  userId: string,
  title: string,
  text: string,
  status: string,
  time: Date
}

export type Rating = {
  userId: string,
  productId: string,
  value: number,
  status: string
}
export type Alarm = {
  id?: string,
  userId: string,
  packId: string,
  storeId: string,
  newPackId: string,
  type: string,
  status: string,
  offerDays: number,
  price: number,
  alternative: string,
  quantity: number,
  time: Date
}
export type Customer = {
  id: string,
  name: string,
  mobile: string,
  storeId: string,
  colors: string[],
  regionId: string,
  status: string,
  orderLimit: number,
  address: string,
  deliveryFees: number,
  mapPosition: string,
  ordersCount: number,
  deliveredOrdersCount: number,
  returnedCount: number,
  deliveredOrdersTotal: number,
  time: Date
}
export type OrderBasketPack = {
  packId: string,
  productName: string,
  productAlias: string,
  packName: string,
  storeId: string,
  price: number,
  actual: number,
  quantity: number,
  weight: number,
  purchased: number,
  gross: number,
  status: string,
  lastPurchaseId: string,
  lastPurchased: number,
  lastWeight: number,
  prevStoreId: string,
  overPriced: boolean,
  closeExpired: boolean,
  oldQuantity: number,
  imageUrl: string,
  returned: number,
  offerId: string,
  isAllocated: boolean
}
export type Order = {
  id?: string,
  userId: string,
  status: string,
  requestType: string,
  total: number,
  deliveryTime: string,
  deliveryFees: number,
  fraction: number,
  profit: number,
  lastUpdate: Date | null,
  requestTime: Date | null,
  time: Date,
  basket: OrderBasketPack[],
  requestBasket: OrderBasketPack[]
}
export type Advert = {
  id?: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl: string,
  time: Date
}
export type Region = {
  id: string,
  name: string,
  fees: number,
  ordering: number
}

export type PasswordRequest = {
  id: string,
  mobile: string,
  status: string,
  time: Date
}
export type Balance = {
  month: number,
  balance: number
}
export type Store = {
  id?: string,
  name: string,
  isActive: boolean,
  mobile: string,
  mapPosition: string,
  openTime: string,
  address: string,
  time: Date,
  balances: Balance[]
}
export type Purchase = {
  id?: string,
  storeId: string,
  total: number,
  time: Date,
  isArchived: boolean,
  basket: StockPack[]
}
export type StockOperation = {
  id?: string,
  purchaseId: string,
  storeId: string,
  type: string,
  total: number,
  basket: StockPack[],
  time: Date
}
export type Product = {
  id?: string,
  name: string,
  alias: string,
  description: string,
  trademark: string,
  countryId: string,
  categoryId: string,
  imageUrl: string,
  sales: number,
  rating: number,
  ratingCount: number,
  isArchived: boolean
}
export type Spending = {
  id?: string,
  type: string,
  amount: number,
  spendingDate: Date,
  description: string,
  time: Date
}
export type MonthlyOperation = {
  id: number,
  ordersCount: number,
  deliveredOrdersCount: number,
  finishedOrdersCount: number,
  stock: number,
  sales: number,
  operationProfit: number,
  deliveryFees: number,
  fractions: number,
  storesBalance: number,
  donations: number,
  damages: number,
  storesProfit: number,
  operationNet: number,
  withdrawals: number,
  expenses: number,
  netProfit: number
}
export type Log = {
  id: string,
  userId: string,
  page: string,
  error: string,
  time: Date
}
export type StorePayment = {
  storeId: string,
  type: string,
  amount: number,
  paymentDate: Date,
}
export type Basket = {
  storeId: string,
  packs: BasketPack[]
}
export type ReturnBasket = {
  storeId: string,
  purchaseId: string,
  type: string,
  packs: StockPack[]
}
export type BasketPack = {
  packId: string,
  productName: string,
  productAlias: string,
  packName: string,
  imageUrl: string,
  price: number,
  actual: number,
  quantity: number,
  weight: number,
  requested: number,
  orderId: string,
  isOffer: boolean,
  isDivided: boolean,
  closeExpired: boolean,
  exceedPriceType: string,
  refPackId: string,
  refPackQuantity: number,
  refQuantity: number
}
export type StockPack = {
  packId: string,
  quantity: number,
  price: number,
  actual: number,
  weight: number
}
export type RequestedPack = {
  packId: string,
  price: number,
  quantity: number,
  orderId: string,
  offerId: string,
  packInfo: Pack,
  weight: number
}
export type Country = {
  id: string,
  name: string,
}
export type State = {
  user?: firebase.User,
  categories: Category[], 
  regions: Region[], 
  countries: Country[],
  stores: Store[], 
  purchases: Purchase[],
  orders: Order[],
  stockOperations: StockOperation[],
  products: Product[],
  packs: Pack[],
  passwordRequests: PasswordRequest[],
  customers: Customer[],
  spendings: Spending[],
  monthlyOperations: MonthlyOperation[],
  packPrices: PackPrice[],
  logs: Log[],
  archivedOrders: Order[],
  adverts: Advert[],
  archivedPurchases: Purchase[],
  archivedStockOperations: StockOperation[],
  archivedProducts: Product[],
  archivedPacks: Pack[],
  notifications: Notification[],
  alarms: Alarm[],
  ratings: Rating[],
  storePayments: StorePayment[],
  basket?: Basket,
  returnBasket?: ReturnBasket,
  orderBasket?: OrderBasketPack[],
  searchText: string,
}

export type Action = {
  type: string
  payload?: any
}

