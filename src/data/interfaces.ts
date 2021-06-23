import firebase from './firebase'

export interface iLabel {
    [key: string]: string
}
export interface iCategory {
}
export interface iError {
  code: string,
  message: string
}
export interface iPack {

}
export interface iPackPrice {

}
export interface iNotification {
}
export interface iFriend {
}
export interface iRating {
}
export interface iAlarm {
}
export interface iUserInfo {
}
export interface iCustomerInfo {
}

export interface iOrder {
}
export interface iAdvert {
}
export interface iLocation {
}
export interface iPasswordRequest {
}
export interface iStore {

}
export interface iPurchase {

}
export interface iStockTrans {

}
export interface iProduct {

}
export interface iSpending {

}
export interface iMonthlyTrans {

}
export interface iLog {

}
export interface iStorePayment {
  
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
  storePayments: iStorePayment[]
}

export interface iAction {
  type: string
  payload?: any
}

export interface iContext {
  state: iState;
  dispatch: React.Dispatch<iAction>
}