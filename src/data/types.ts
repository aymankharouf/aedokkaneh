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
  product: Product,
  price: number,
  isOffer?: boolean,
  unitsCount: number,
  quantityType: string,
}
export type PackPrice = {
  packId: string,
  storeId: string,
  price: number,
  isActive: boolean,
  lastUpdate: Date
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
export type Customer = {
  id: string,
  name: string,
  mobile: string,
  colors: string[],
  regionId: string,
  status: string,
  storeId: string,
  orderLimit: number,
  address: string,
  deliveryFees: number,
  mapPosition: string,
  ordersCount: number,
  deliveredOrdersCount: number,
  time: Date
}
export type OrderPack = {
  pack: Pack,
  price: number,
  actual: number,
  quantity: number,
  weight: number,
  purchased: number,
  gross: number,
  status: string,
  overPriced: boolean,
  oldQuantity: number,
}
export type OrderTrans = {
  type: string,
  time: number
}
export type Order = {
  id?: string,
  userId: string,
  status: string,
  total: number,
  deliveryTime: string,
  deliveryFees: number,
  fraction: number,
  profit: number,
  lastUpdate: Date,
  basket: OrderPack[],
  trans: OrderTrans[]
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
export type Store = {
  id?: string,
  name: string,
  isActive: boolean,
  mobile: string,
  mapPosition: string,
  openTime: string,
  address: string,
}
export type StoreTrans = {
  storeId: string,
  packId: string,
  oldPrice: number,
  newPrice: number,
  status: string,
  time: Date
}
export type Purchase = {
  id?: string,
  storeId: string,
  total: number,
  time: Date,
  isArchived: boolean,
  basket: PurchasePack[]
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
  donations: number,
  damages: number,
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
export type Basket = {
  storeId: string,
  packs: BasketPack[]
}
export type BasketPack = {
  pack: Pack,
  price: number,
  actual?: number,
  quantity: number,
  weight: number,
  exceedPriceType?: string,
}
export type StockTrans = {
  type: string,
  quantity: number,
  weight: number,
  price: number,
  refId: string,
  time: number
}
export type PurchasePack = {
  packId: string,
  quantity: number,
  price: number,
  weight: number,
}
export type Stock = {
  id?: string,
  quantity: number,
  price: number,
  weight: number,
  trans?: StockTrans[],
  isArchived?: boolean
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
  stocks: Stock[],
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
  archivedProducts: Product[],
  archivedPacks: Pack[],
  notifications: Notification[],
  ratings: Rating[],
  basket?: Basket,
  searchText: string,
  storeTrans: StoreTrans[]
}

export type Action = {
  type: string
  payload?: any
}

