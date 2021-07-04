import { createContext, useReducer, useEffect } from 'react'
import Reducer from './reducer'
import firebase from './firebase'
import { Advert, Alarm, Category, Context, CustomerInfo, Friend, Log, MonthlyOperation, Notification, Order, Pack, PackPrice, PasswordRequest, Product, Purchase, Rating, Spending, StockOperation, Store, StorePayment, UserInfo } from './types'

export const StateContext = createContext({} as Context)

type Props = {
  children: React.ReactElement
}
const StateProvider = ({children}: Props) => {
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
    invitations: [],
    storePayments: [],
    searchText: ''
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories: Category[] = []
      docs.forEach(doc => {
        categories.push({
          id: doc.id,
          parentId: doc.data().parentId,
          name: doc.data().name,
          ordering: doc.data().ordering,
          isLeaf: doc.data().isLeaf,
          isActive: doc.data().isActive
        })
      })
      dispatch({type: 'SET_CATEGORIES', payload: categories})
    }, err => {
      unsubscribeCategories()
    })
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs: Pack[] = []
      let packPrices: PackPrice[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          productId: doc.data().productId,
          productName: doc.data().productName,
          productAlias: doc.data().productAlias,
          productDescription: doc.data().productDescription,
          categoryId: doc.data().categoryId,
          trademark: doc.data().trademark,
          country: doc.data().country,
          sales: doc.data().sales,
          rating: doc.data().rating,
          ratingCount: doc.data().ratingCount,
          price: doc.data().price,
          imageUrl: doc.data().imageUrl,
          subPackId: doc.data().subPackId,
          specialImage: doc.data().specialImage,
          bonusPackId: doc.data().bonusPackId,
          isOffer: doc.data().isOffer,
          offerEnd: doc.data().offerEnd?.toDate() || null,
          closeExpired: doc.data().closeExpired,
          forSale: doc.data().forSale,
          subQuantity: doc.data().subQuantity,
          subPercent: doc.data().subPercent,
          bonusQuantity: doc.data().bonusQuantity,
          bonusPercent: doc.data().bonusPercent,
          unitsCount: doc.data().unitsCount,
          byWeight: doc.data().byWeight,
          isDivided: doc.data().isDivided
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({
              packId: doc.id,
              storeId: p.storeId,
              quantity: p.quantity,
              weight: p.weight,
              price: p.price,
              cost: p.cost,
              isActive: p.isActive,
              offerEnd: p.offerEnd?.toDate() || null,
              time: p.time.toDate(),
              isAuto: p.isAuto
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
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products: Product[] = []
          docs.forEach(doc => {
            products.push({
              id: doc.id,
              name: doc.data().name,
              alias: doc.data().alias,
              description: doc.data().description,
              trademark: doc.data().trademark,
              country: doc.data().country,
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
              requestType: doc.data().requestType,
              total: doc.data().total,
              deliveryTime: doc.data().deliveryTime,
              deliveryFees: doc.data().deliveryFees,
              discount: doc.data().discount,
              fixedFees: doc.data().fixedFees,
              fraction: doc.data().fraction,
              profit: doc.data().profit,
              lastUpdate: doc.data().lastUpdate?.toDate() || null,
              requestTime: doc.data().requestTime?.toDate() || null,
              basket: doc.data().basket,
              requestBasket: doc.data().requestBasket,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        })  
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          const users: UserInfo[] = []
          const notifications: Notification[] = []
          const alarms: Alarm[] = []
          const ratings: Rating[] = []
          const invitations: Friend[] = []
          docs.forEach(doc => {
            users.push({
              id: doc.id,
              name: doc.data().name,
              mobile: doc.data().mobile,
              storeName: doc.data().storeName,
              colors: doc.data().colors,
              regionId: doc.data().regionId,
              time: doc.data().time.toDate()
            })
            if (doc.data().notifications) {
              doc.data().notifications.forEach((n: any) => {
                notifications.push({
                  userId: doc.id,
                  id: n.id,
                  title: n.title,
                  message: n.message,
                  status: n.status,
                  time: n.time.toDate()
                })
              })
            }
            if (doc.data().alarms) {
              doc.data().alarms.forEach((a: any) => {
                alarms.push({
                  userId: doc.id,
                  id: a.id,
                  packId: a.packId,
                  storeId: a.storeId,
                  newPackId: a.newPackId,
                  type: a.type,
                  status: a.status,
                  offerDays: a.offerDays,
                  price: a.price,
                  alternative: a.alternative,
                  quantity: a.quantity,
                  time: a.time.toDate()
                })
              })
            }
            if (doc.data().ratings) {
              doc.data().ratings.forEach((r: any) => {
                ratings.push({...r, userId: doc.id})
              })
            }
            if (doc.data().friends) {
              doc.data().friends.forEach((f: any) => {
                invitations.push({...f, userId: doc.id})
              })
            }
          })
          dispatch({type: 'SET_USERS', payload: users})
          dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          dispatch({type: 'SET_ALARMS', payload: alarms})
          dispatch({type: 'SET_RATINGS', payload: ratings})
          dispatch({type: 'SET_INVITATIONS', payload: invitations})
        }, err => {
          unsubscribeUsers()
        })  
        const unsubscribeCustomers = firebase.firestore().collection('customers').onSnapshot(docs => {
          let customers: CustomerInfo[] = []
          docs.forEach(doc => {
            customers.push({
              id: doc.id,
              name: doc.data().name,
              storeId: doc.data().storeId,
              storeName: doc.data().storeName,
              orderLimit: doc.data().orderLimit,
              isBlocked: doc.data().isBlocked,
              address: doc.data().address,
              deliveryFees: doc.data().deliveryFees,
              specialDiscount: doc.data().specialDiscount,
              discounts: doc.data().discounts,
              mapPosition: doc.data().mapPosition,
              ordersCount: doc.data().ordersCount,
              deliveredOrdersCount: doc.data().deliveredOrdersCount,
              returnedCount: doc.data().returnedCount,
              deliveredOrdersTotal: doc.data().deliveredOrdersTotal,
              time: doc.data().time.toDate()
            })
          })
          dispatch({type: 'SET_CUSTOMERS', payload: customers})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: Store[] = []
          let storePayments: StorePayment[] = []
          docs.forEach(doc => {
            stores.push({
              id: doc.id,
              name: doc.data().name,
              type: doc.data().type,
              discount: doc.data().discount,
              isActive: doc.data().isActive,
              allowReturn: doc.data().allowReturn,
              mobile: doc.data().mobile,
              mapPosition: doc.data().mapPosition,
              openTime: doc.data().openTime,
              address: doc.data().address,
              time: doc.data().time.toDate(),
              balances: doc.data().balances
            })
            if (doc.data().payments) {
              doc.data().payments.forEach((p: any) => {
                storePayments.push({...p, storeId: doc.id, storeInfo: doc.data()})
              })
            }
          })
          dispatch({type: 'SET_STORES', payload: stores})
          dispatch({type: 'SET_STORE_PAYMENTS', payload: storePayments})
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
        const unsubscribeStockOperations = firebase.firestore().collection('stock-operations').where('isArchived', '==', false).onSnapshot(docs => {
          const stockOperations: StockOperation[] = []
          docs.forEach(doc => {
            stockOperations.push({
              id: doc.id,
              purchaseId: doc.data().purchaseId,
              type: doc.data().type,
              total: doc.data().total,
              storeId: doc.data().storeId,
              time: doc.data().time.toDate(),
              basket: doc.data().basket
            })
          })
          dispatch({type: 'SET_STOCK_OPERATIONS', payload: stockOperations})
        }, err => {
          unsubscribeStockOperations()
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
              fixedFees: doc.data().fixedFees,
              deliveryFees: doc.data().deliveryFees,
              fractions: doc.data().fractions,
              discounts: doc.data().discounts,
              specialDiscounts: doc.data().specialDiscounts,
              storesBalance: doc.data().storesBalance,
              donations: doc.data().donations,
              damages: doc.data().damages,
              storesProfit: doc.data().storesProfit,
              operationNet: doc.data().operationNet,
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
      } else {
        dispatch({type: 'LOGOUT'})
      }
    })
  }, [])
  return (
    <StateContext.Provider value={{state, dispatch}}>
      {children}
    </StateContext.Provider>
  )
}
 
export default StateProvider

