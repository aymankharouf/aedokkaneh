const Reducer = (state, action) => {
    let pack, packIndex, packs, nextQuantity
    const increment = [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7]
    switch (action.type){
      case 'ADD_TO_BASKET':
        pack = {
          packId: action.params.pack.id,
          price: action.params.price,
          quantity: action.params.quantity,
          actual: action.params.packStore.price,
          cost: action.params.packStore.cost,
          requested: action.params.requested,
          isDivided: action.params.pack.isDivided,
          orderId: action.params.orderId,
          weight: action.params.weight,
          isOffer: action.params.packStore.isOffer,
          exceedPriceType: action.params.exceedPriceType,
          time: new Date()
        }
        if (!state.basket.storeId) {
          return {...state, basket: {storeId: action.params.packStore.storeId, packs: [pack]}}
        } else {
          if (state.basket.storeId !== action.params.packStore.storeId) return state
          if (state.basket.packs && state.basket.packs.find(p => p.id === action.params.pack.id)) return state
          return {...state, basket: {...state.basket, packs: [...state.basket.packs, pack]}}
        }
      case 'INCREASE_QUANTITY':
        if (!action.pack.isDivided && (!action.pack.orderId || !(action.pack.quantity + 1 > action.pack.requested))) {
          pack = {
            ...action.pack,
            quantity: action.pack.quantity + 1
          }
        }
        packs = state.basket.packs.slice()
        packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        packs.splice(packIndex, 1, pack)
        return {...state, basket: {...state.basket, packs}}
      case 'DECREASE_QUANTITY':
        if (action.pack.isDivided) {
          nextQuantity = 0
        } else {
          nextQuantity = action.pack.quantity - 1
        }
        packs = state.basket.packs.slice()
        packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        if (nextQuantity === 0) {
          packs.splice(packIndex, 1)
          if (packs.length === 0){
            return {...state, basket: ''}
          }
        } else {
          pack = {
            ...action.pack,
            quantity: nextQuantity
          }
          packs.splice(packIndex, 1, pack)
        }
        return {...state, basket: {...state.basket, packs}}
      case 'CLEAR_BASKET':
        return {
          ...state,
          basket: ''
        }
      case 'LOAD_ORDER_BASKET':
        return {
          ...state,
          orderBasket: action.order.basket
        }
      case 'CLEAR_ORDER_BASKET':
        return {
          ...state,
          orderBasket: []
        }
      case 'INCREASE_ORDER_QUANTITY':
        if (action.pack.isDivided) {
          nextQuantity = increment.filter(i => i > action.pack.quantity)
          nextQuantity = Math.min(...nextQuantity)
          nextQuantity = nextQuantity === Infinity ? action.pack.quantity : nextQuantity
        } else {
          nextQuantity = action.pack.quantity + 1
        }
        pack = {
          ...action.pack,
          quantity: nextQuantity,
          gross: parseInt(action.pack.price * nextQuantity)
        }
        packs = state.orderBasket.slice()
        packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        packs.splice(packIndex, 1, pack)  
        return {...state, orderBasket: packs}
      case 'DECREASE_ORDER_QUANTITY':
        if (action.pack.weight) {
          if (action.pack.isDivided) {
            if (action.pack.quantity > action.pack.weight) {
              nextQuantity = action.pack.weight
            } else {
              nextQuantity = 0
            }  
          } else {
            if (action.pack.quantity > action.pack.purchased) {
              nextQuantity = action.pack.purchased
            } else {
              nextQuantity = 0
            }  
          }
        } else if (action.pack.isDivided) {
          nextQuantity = increment.filter(i => i < action.pack.quantity)
          nextQuantity = Math.max(...nextQuantity)
          nextQuantity = nextQuantity === -Infinity ? 0 : nextQuantity
        } else {
          nextQuantity = action.pack.quantity - 1
        }
        pack = {
          ...action.pack,
          quantity: nextQuantity,
          gross: parseInt(action.pack.price * nextQuantity)
        }  
        packs = state.orderBasket.slice()
        packIndex = packs.findIndex(p => p.packId === action.pack.packId)
        packs.splice(packIndex, 1, pack)  
        return {...state, orderBasket: packs}
      case 'SET_COUNTRIES':
        return {
          ...state,
          countries: action.countries
        }
      case 'SET_STORES':
        return {
          ...state,
          stores: action.stores
        }
      case 'SET_CATEGORIES':
        return {
          ...state,
          categories: action.categories
        }
      case 'SET_TRADEMARKS':
        return {
          ...state,
          trademarks: action.trademarks
        }
      case 'SET_USERS':
        return {
          ...state,
          users: action.users
        }
      case 'SET_PURCHASES':
        return {
          ...state,
          purchases: action.purchases
        }
      case 'SET_ORDERS':
        return {
          ...state,
          orders: action.orders
        }
      case 'SET_STOCK_TRANS':
        return {
          ...state,
          stockTrans: action.stockTrans
        }
      case 'SET_PASSWORD_REQUESTS':
        return {
          ...state,
          passwordRequests: action.passwordRequests
        }
      case 'SET_PRODUCTS':
        return {
          ...state,
          products: action.products
        }
      case 'SET_PACKS':
        return {
          ...state,
          packs: action.packs
        }
      case 'SET_CUSTOMERS':
        return {
          ...state,
          customers: action.customers
        }
      case 'SET_SPENDINGS':
        return {
          ...state,
          spendings: action.spendings
        }
      case 'SET_MONTHLY_TRANS':
        return {
          ...state,
          monthlyTrans: action.monthlyTrans
        }
      case 'SET_LOCATIONS':
        return {
          ...state,
          locations: action.locations
        }
      case 'SET_STORE_PACKS':
        return {
          ...state,
          storePacks: action.storePacks
        }
      case 'SET_LOGS':
        return {
          ...state,
          logs: action.logs
        }
      case 'SET_TAGS':
        return {
          ...state,
          tags: action.tags
        }
      case 'ADD_ARCHIVED_ORDERS':
        return {
          ...state,
          archivedOrders: [...state.archivedOrders, ...action.orders]
        }
      case 'SET_ADVERTS':
        return {
          ...state,
          adverts: action.adverts
        }
      case 'ADD_ARCHIVED_PURCHASES':
        return {
          ...state,
          archivedPurchases: [...state.archivedPurchases, ...action.purchases]
        }
      case 'ADD_ARCHIVED_STOCK_TRANS':
        return {
          ...state,
          archivedStockTrans: [...state.archivedStockTrans, ...action.stockTrans]
        }
      case 'SET_ARCHIVED_PRODUCTS':
        return {
          ...state,
          archivedProducts: action.archivedProducts
        }
      case 'SET_ARCHIVED_PACKS':
        return {
          ...state,
          archivedPacks: action.archivedPacks
        }
      default:
        return state
    }
  }
  
  export default Reducer