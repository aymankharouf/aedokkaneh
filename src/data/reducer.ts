import { State, Action } from './types'

const localData = localStorage.getItem('basket')
const basket = localData ? JSON.parse(localData) : ''
const initState = {
  categories: [], 
  regions: [], 
  countries: [],
  stores: [], 
  basket, 
  users: [],
  purchases: [],
  orders: [],
  stocks: [],
  stockOperations: [],
  products: [],
  packs: [],
  passwordRequests: [],
  customers: [],
  spendings: [],
  monthlyOperations: [],
  packPrices: [],
  logs: [],
  archivedOrders: [],
  adverts: [],
  archivedPurchases: [],
  archivedStockOperations: [],
  archivedProducts: [],
  archivedPacks: [],
  notifications: [],
  alarms: [],
  ratings: [],
  storePayments: [],
  searchText: '',
  storeTrans: []
}

const reducer = (state: State = initState, action: Action) => {
  let basketPack, packIndex, packs, nextQuantity, i
    const increment = [0.125, 0.25, 0.5, 0.75, 1]
    switch (action.type){
      case 'ADD_TO_BASKET':
        basketPack = {
          pack: action.payload.pack,
          price: action.payload.packPrice.price,
          quantity: action.payload.pack.isDivided ? action.payload.weight : 1,
          weight: action.payload.weight,
        }
        if (!state.basket?.storeId) {
          return {...state, basket: {storeId: action.payload.store.id, packs: [basketPack]}}
        } else {
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, basketPack]}}
        }
      case 'INCREASE_QUANTITY':
        basketPack = state.basket?.packs.find(p => p.pack?.id === action.payload)!
        basketPack = {
          ...basketPack,
          quantity: basketPack.quantity + 1
        }
        packs = state.basket?.packs.slice()!
        packIndex = packs.findIndex(p => p.packId === action.payload)
        packs.splice(packIndex, 1, basketPack)
        return {...state, basket: {...state.basket!, packs}}
      case 'DECREASE_QUANTITY':
        basketPack = state.basket?.packs.find(p => p.pack?.id === action.payload)!
        packs = state.basket?.packs.slice()
        if (!packs) return state
        if (basketPack.weight) {
          nextQuantity = 0
          packIndex = packs.findIndex(p => p.packId === action.payload)
        } else {
          nextQuantity = basketPack.quantity - 1
          packIndex = packs.findIndex(p => p.packId === action.payload)
        }
        if (nextQuantity === 0) {
          packs.splice(packIndex, 1)
          if (packs.length === 0){
            return {...state, basket: undefined}
          }
        } else {
          basketPack = {
            ...basketPack,
            quantity: nextQuantity
          }
          packs.splice(packIndex, 1, basketPack)
        }
        return {...state, basket: {...state.basket!, packs}}
      case 'CLEAR_BASKET':
        return {...state, basket: undefined}
      case 'LOAD_ORDER_BASKET':
        return {...state, orderBasket: action.payload}
      case 'CLEAR_ORDER_BASKET':
        return {...state, orderBasket: undefined}
      case 'INCREASE_ORDER_QUANTITY':
        if (action.payload.packInfo.isDivided) {
          if (action.payload.quantity >= 1) {
            nextQuantity = action.payload.quantity + 0.5
          } else {
            i = increment.indexOf(action.payload.quantity)
            nextQuantity = increment[++i]  
          }
        } else {
          nextQuantity = action.payload.quantity + 1
        }
        basketPack = {
          ...action.payload,
          quantity: nextQuantity,
          gross: Math.round((action.payload.actual || action.payload.price) * nextQuantity)
        }
        packs = state.orderBasket?.slice()
        if (!packs) return state
        packIndex = packs.findIndex(p => p.packId === action.payload.packId)
        packs.splice(packIndex, 1, basketPack)  
        return {...state, orderBasket: packs}
      case 'DECREASE_ORDER_QUANTITY':
        if (action.payload.pack.weight) {
          if (action.payload.type === 'r') {
            nextQuantity = 0
          } else {
            if (action.payload.pack.quantity > action.payload.pack.purchased) {
              nextQuantity = action.payload.pack.purchased
            } else {
              nextQuantity = 0
            }  
          }
        } else if (action.payload.pack.packInfo.isDivided) {
          if (action.payload.pack.quantity > 1) {
            nextQuantity = action.payload.pack.quantity - 0.5
          } else {
            i = increment.indexOf(action.payload.pack.quantity)
            nextQuantity = i === 0 ? increment[0] : increment[--i]  
          }
        } else {
          nextQuantity = action.payload.pack.quantity - 1
        }
        basketPack = {
          ...action.payload.pack,
          quantity: nextQuantity,
          gross: Math.round((action.payload.pack.actual || action.payload.pack.price) * nextQuantity)
        }  
        packs = state.orderBasket?.slice()
        if (!packs) return state
        packIndex = packs.findIndex(p => p.packId === action.payload.pack.packId)
        packs.splice(packIndex, 1, basketPack)  
        return {...state, orderBasket: packs}
      case 'ADD_TO_RETURN_BASKET':
        basketPack = {
          packId: action.payload.packId,
          price: action.payload.price,
          actual: action.payload.price,
          quantity: action.payload.quantity,
          weight: action.payload.weight
        }
        if (!state.returnBasket?.type) {
          return {
            ...state, 
            returnBasket: {
              storeId: action.payload.storeId, 
              type: action.payload.type, 
              purchaseId: action.payload.purchaseId, 
              packs: [basketPack]
            }
          }
        } else {
          return {...state, returnBasket: {...state.returnBasket!, packs: [...state.returnBasket.packs, basketPack]}}
        }
      case 'REMOVE_FROM_RETURN_BASKET':
        const basket = state.returnBasket?.packs.slice()
        if (!basket) return state
        packIndex = basket.findIndex(p => p.packId === action.payload.packId)
        basket.splice(packIndex, 1)
        if (basket.length === 0) {
          return {...state, returnBasket: undefined}
        } else {
          return {...state, returnBasket: {...state.returnBasket!, packs: basket}}  
        }
      case 'CLEAR_RETURN_BASKET':
        return {...state, returnBasket: undefined}  
      case 'SET_REGIONS':
        return {...state, regions: action.payload}
      case 'SET_COUNTRIES':
        return {...state, countries: action.payload}
      case 'SET_TRADEMARKS':
        return {...state, trademarks: action.payload}
      case 'SET_NOTIFICATIONS':
        return {...state, notifications: action.payload}
      case 'SET_RATINGS':
        return {...state, ratings: action.payload}
      case 'SET_STORES':
        return {...state, stores: action.payload}
      case 'SET_CATEGORIES':
        return {...state, categories: action.payload}
      case 'SET_USERS':
        return {...state, users: action.payload}
      case 'SET_PURCHASES':
        return {...state, purchases: action.payload}
      case 'SET_ORDERS':
        return {...state, orders: action.payload}
      case 'SET_STOCKS':
        return {...state, stocks: action.payload}
      case 'SET_STOCK_OPERATIONS':
        return {...state, stockOperations: action.payload}
      case 'SET_PASSWORD_REQUESTS':
        return {...state, passwordRequests: action.payload}
      case 'SET_PRODUCTS':
        return {...state, products: action.payload}
      case 'SET_PACKS':
        return {...state, packs: action.payload}
      case 'SET_CUSTOMERS':
        return {...state, customers: action.payload}
      case 'SET_SPENDINGS':
        return {...state, spendings: action.payload}
      case 'SET_MONTHLY_OPERATIONS':
        return {...state, monthlyOperations: action.payload}
      case 'SET_PACK_PRICES':
        return {...state, packPrices: action.payload}
      case 'SET_LOGS':
        return {...state, logs: action.payload}
      case 'SET_STORE_TRANS':
        return {...state, storeTrans: action.payload}
      case 'ADD_ARCHIVED_ORDERS':
        return {...state, archivedOrders: [...state.archivedOrders, ...action.payload]}
      case 'SET_ADVERTS':
        return {...state, adverts: action.payload}
      case 'ADD_ARCHIVED_PURCHASES':
        return {...state, archivedPurchases: [...state.archivedPurchases, ...action.payload]}
      case 'ADD_ARCHIVED_STOCK_OPERATIONS':
        return {...state, archivedStockOperations: [...state.archivedStockOperations, ...action.payload]}
      case 'SET_ARCHIVED_PRODUCTS':
        return {...state, archivedProducts: action.payload}
      case 'SET_ARCHIVED_PACKS':
        return {...state, archivedPacks: action.payload}
      case 'SET_STORE_PAYMENTS':
        return {...state, storePayments: action.payload}
      case 'LOGIN':
        return {...state, user: action.payload}
      case 'LOGOUT':
        return {...state, user: undefined}
      case 'SET_SEARCH':
        return {...state, searchText: action.payload}
      default:
        return state
    }
  }
  
  export default reducer