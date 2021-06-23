import { iState, iAction } from './interfaces'

const Reducer = (state: iState, action: iAction) => {
    let pack, packIndex, packs, nextQuantity, i
    const increment = [0.125, 0.25, 0.5, 0.75, 1]
    switch (action.type){
      case 'ADD_TO_BASKET':
        // pack = {
        //   packId: action.params.pack.id,
        //   productName: action.params.pack.productName,
        //   productAlias: action.params.pack.productAlias,
        //   packName: action.params.pack.name,
        //   imageUrl: action.params.pack.imageUrl,
        //   price: action.params.price,
        //   quantity: action.params.quantity,
        //   actual: action.params.packStore.price,
        //   cost: action.params.packStore.cost,
        //   requested: action.params.quantity,
        //   orderId: action.params.orderId,
        //   weight: action.params.weight,
        //   isOffer: action.params.packStore.isOffer,
        //   exceedPriceType: action.params.exceedPriceType,
        //   isDivided: action.params.pack.isDivided,
        //   closeExpired: action.params.pack.closeExpired,
        //   refPackId: action.params.refPackId,
        //   refPackQuantity: action.params.refPackQuantity
        // }
        // if (!state.basket.storeId) {
        //   return {...state, basket: {storeId: action.params.packStore.storeId, packs: [pack]}}
        // } else {
        //   return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        // }
      case 'INCREASE_QUANTITY':
        // pack = {
        //   ...action.pack,
        //   quantity: action.pack.quantity + 1
        // }
        // packs = state.basket.packs.slice()
        // packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        // packs.splice(packIndex, 1, pack)
        // return {...state, basket: {...state.basket, packs}}
      case 'DECREASE_QUANTITY':
        // packs = state.basket.packs.slice()
        // if (action.pack.isDivided) {
        //   nextQuantity = 0
        //   packIndex = packs.findIndex(p => p.packId === action.pack.packId && p.orderId === action.pack.orderId)
        // } else {
        //   nextQuantity = action.pack.quantity - 1
        //   packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        // }
        // if (nextQuantity === 0) {
        //   packs.splice(packIndex, 1)
        //   if (packs.length === 0){
        //     return {...state, basket: ''}
        //   }
        // } else {
        //   pack = {
        //     ...action.pack,
        //     quantity: nextQuantity
        //   }
        //   packs.splice(packIndex, 1, pack)
        // }
        // return {...state, basket: {...state.basket, packs}}
      case 'CLEAR_BASKET':
        return {...state, basket: undefined}
      case 'LOAD_ORDER_BASKET':
        // return {
        //   ...state,
        //   orderBasket: action.params.order.basket.map(p => {
        //     return {
        //       ...p,
        //       quantity: action.params.type === 'e' ? p.quantity : p.purchased,
        //       oldQuantity: action.params.type === 'e' ? p.quantity : p.purchased
        //     }
        //   })
        // }
      case 'CLEAR_ORDER_BASKET':
        return {...state, orderBasket: undefined}
      case 'INCREASE_ORDER_QUANTITY':
        // if (action.pack.packInfo.isDivided) {
        //   if (action.pack.quantity >= 1) {
        //     nextQuantity = action.pack.quantity + 0.5
        //   } else {
        //     i = increment.indexOf(action.pack.quantity)
        //     nextQuantity = increment[++i]  
        //   }
        // } else {
        //   nextQuantity = action.pack.quantity + 1
        // }
        // pack = {
        //   ...action.pack,
        //   quantity: nextQuantity,
        //   gross: Math.round((action.pack.actual || action.pack.price) * nextQuantity)
        // }
        // packs = state.orderBasket.slice()
        // packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        // packs.splice(packIndex, 1, pack)  
        // return {...state, orderBasket: packs}
      case 'DECREASE_ORDER_QUANTITY':
        // if (action.params.pack.weight) {
        //   if (action.params.type === 'r') {
        //     nextQuantity = 0
        //   } else {
        //     if (action.params.pack.quantity > action.params.pack.purchased) {
        //       nextQuantity = action.params.pack.purchased
        //     } else {
        //       nextQuantity = 0
        //     }  
        //   }
        // } else if (action.params.pack.packInfo.isDivided) {
        //   if (action.params.pack.quantity > 1) {
        //     nextQuantity = action.params.pack.quantity - 0.5
        //   } else {
        //     i = increment.indexOf(action.params.pack.quantity)
        //     nextQuantity = i === 0 ? increment[0] : increment[--i]  
        //   }
        // } else {
        //   nextQuantity = action.params.pack.quantity - 1
        // }
        // pack = {
        //   ...action.params.pack,
        //   quantity: nextQuantity,
        //   gross: Math.round((action.params.pack.actual || action.params.pack.price) * nextQuantity)
        // }  
        // packs = state.orderBasket.slice()
        // packIndex = packs.findIndex(p => p.packId === action.params.pack.packId)
        // packs.splice(packIndex, 1, pack)  
        // return {...state, orderBasket: packs}
      case 'ADD_TO_RETURN_BASKET':
        // pack = {
        //   packId: action.params.packId,
        //   cost: action.params.cost,
        //   price: action.params.price,
        //   quantity: action.params.quantity,
        //   weight: action.params.weight
        // }
        // if (!state.returnBasket?.type) {
        //   return {
        //     ...state, 
        //     returnBasket: {
        //       storeId: action.params.storeId, 
        //       type: action.params.type, 
        //       purchaseId: action.params.purchaseId, 
        //       packs: [pack]
        //     }
        //   }
        // } else {
        //   return {...state, returnBasket: {...state.returnBasket, packs: [...state.returnBasket.packs, pack]}}
        // }
      case 'REMOVE_FROM_RETURN_BASKET':
        // const basket = state.returnBasket.packs.slice()
        // packIndex = basket.findIndex(p => p.packId === action.pack.packId)
        // basket.splice(packIndex, 1)
        // if (basket.length === 0) {
        //   return {...state, returnBasket: undefined}
        // } else {
        //   return {...state, returnBasket: {...state.returnBasket, packs: basket}}  
        // }
      case 'CLEAR_RETURN_BASKET':
        return {...state, returnBasket: undefined}  
      case 'SET_LOCATIONS':
        return {...state, locations: action.payload}
      case 'SET_COUNTRIES':
        return {...state, countries: action.payload}
      case 'SET_NOTIFICATIONS':
        return {...state, notifications: action.payload}
      case 'SET_ALARMS':
        return {...state, alarms: action.payload}
      case 'SET_RATINGS':
        return {...state, ratings: action.payload}
      case 'SET_INVITATIONS':
        return {...state, invitations: action.payload}
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
      case 'SET_STOCK_TRANS':
        return {...state, stockTrans: action.payload}
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
      case 'SET_MONTHLY_TRANS':
        return {...state, monthlyTrans: action.payload}
      case 'SET_PACK_PRICES':
        return {...state, packPrices: action.payload}
      case 'SET_LOGS':
        return {...state, logs: action.payload}
      case 'ADD_ARCHIVED_ORDERS':
        return {...state, archivedOrders: [...state.archivedOrders, ...action.payload]}
      case 'SET_ADVERTS':
        return {...state, adverts: action.payload}
      case 'ADD_ARCHIVED_PURCHASES':
        return {...state, archivedPurchases: [...state.archivedPurchases, ...action.payload]}
      case 'ADD_ARCHIVED_STOCK_TRANS':
        return {...state, archivedStockTrans: [...state.archivedStockTrans, ...action.payload]}
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
      default:
        return state
    }
  }
  
  export default Reducer