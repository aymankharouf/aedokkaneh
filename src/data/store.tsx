import { createContext, useReducer, useEffect, useState } from 'react'
import Reducer from './reducer'
import firebase from './firebase'
import { iAdvert, iAlarm, iCategory, iContext, iCustomerInfo, iFriend, iLog, iMonthlyTrans, iNotification, iOrder, iPack, iPackPrice, iPasswordRequest, iProduct, iPurchase, iRating, iSpending, iStockTrans, iStore, iStorePayment, iUserInfo } from './interfaces'

export const StoreContext = createContext({} as iContext)

const Store = (props: any) => {
  const localData = localStorage.getItem('basket')
  const basket = localData ? JSON.parse(localData) : ''
  const initState = {
    categories: [], 
    locations: [], 
    countries: [],
    stores: [], 
    basket, 
    users: [],
    purchases: [],
    orders: [],
    stockTrans: [],
    products: [],
    packs: [],
    passwordRequests: [],
    customers: [],
    spendings: [],
    monthlyTrans: [],
    packPrices: [],
    logs: [],
    archivedOrders: [],
    adverts: [],
    archivedPurchases: [],
    archivedStockTrans: [],
    archivedProducts: [],
    archivedPacks: [],
    notifications: [],
    alarms: [],
    ratings: [],
    invitations: [],
    storePayments: []
  }
  const [state, dispatch] = useReducer(Reducer, initState)
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('categories').onSnapshot(docs => {
      let categories: iCategory[] = []
      docs.forEach(doc => {
        categories.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_CATEGORIES', payload: categories})
    }, err => {
      unsubscribeCategories()
    })
    const unsubscribePacks = firebase.firestore().collection('packs').where('isArchived', '==', false).onSnapshot(docs => {
      let packs: iPack[] = []
      let packPrices: iPackPrice[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          productId: doc.data().productId
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({...p, packId: doc.id})
          })
        }
      })
      dispatch({type: 'SET_PACKS', payload: packs})
      dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
    }, err => {
      unsubscribePacks()
    })
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests: iPasswordRequest[] = []
      docs.forEach(doc => {
        passwordRequests.push({...doc.data(), id:doc.id})
      })
      dispatch({type: 'SET_PASSWORD_REQUESTS', payload: passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
    })
    const unsubscribeAdverts = firebase.firestore().collection('adverts').onSnapshot(docs => {
      let adverts: iAdvert[] = []
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
        const unsubscribeLocations = firebase.firestore().collection('lookups').doc('l').onSnapshot(doc => {
          if (doc.exists) dispatch({type: 'SET_LOCATIONS', payload: doc.data()?.values})
        }, err => {
          unsubscribeLocations()
        })  
        const unsubscribeCountries = firebase.firestore().collection('lookups').doc('c').onSnapshot(doc => {
          if (doc.exists) dispatch({type: 'SET_COUNTRIES', payload: doc.data()?.values})
        }, err => {
          unsubscribeCountries()
        })
        const unsubscribeProducts = firebase.firestore().collection('products').where('isArchived', '==', false).onSnapshot(docs => {
          let products: iProduct[] = []
          docs.forEach(doc => {
            products.push({
              id: doc.id,
              country: doc.data().country
            })
          })
          dispatch({type: 'SET_PRODUCTS', payload: products})
        }, err => {
          unsubscribeProducts()
        })    
        const unsubscribeOrders = firebase.firestore().collection('orders').where('isArchived', '==', false).onSnapshot(docs => {
          let orders: iOrder[] = []
          docs.forEach(doc => {
            orders.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        })  
        const unsubscribeUsers = firebase.firestore().collection('users').onSnapshot(docs => {
          let users: iUserInfo[] = []
          let notifications: iNotification[] = []
          let alarms: iAlarm[] = []
          let ratings: iRating[] = []
          let invitations: iFriend[] = []
          docs.forEach(doc => {
            users.push({
              id: doc.id,
              name: doc.data().name,
              mobile: doc.data().mobile
            })
            if (doc.data().notifications) {
              doc.data().notifications.forEach((n: any) => {
                notifications.push({...n, userId: doc.id})
              })
            }
            if (doc.data().alarms) {
              doc.data().alarms.forEach((a: any) => {
                alarms.push({...a, userId: doc.id})
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
          let customers: iCustomerInfo[] = []
          docs.forEach(doc => {
            customers.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_CUSTOMERS', payload: customers})
        }, err => {
          unsubscribeCustomers()
        })  
        const unsubscribeStores = firebase.firestore().collection('stores').onSnapshot(docs => {
          let stores: iStore[] = []
          let storePayments: iStorePayment[] = []
          docs.forEach(doc => {
            stores.push({...doc.data(), id:doc.id})
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
          let purchases: iPurchase[] = []
          docs.forEach(doc => {
            purchases.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_PURCHASES', payload: purchases})
        }, err => {
          unsubscribePurchases()
        })  
        const unsubscribeStockTrans = firebase.firestore().collection('stock-trans').where('isArchived', '==', false).onSnapshot(docs => {
          let stockTrans: iStockTrans[] = []
          docs.forEach(doc => {
            stockTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_STOCK_TRANS', payload: stockTrans})
        }, err => {
          unsubscribeStockTrans()
        })  
        const unsubscribeSpendings = firebase.firestore().collection('spendings').onSnapshot(docs => {
          let spendings: iSpending[] = []
          docs.forEach(doc => {
            spendings.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_SPENDINGS', payload: spendings})
        }, err => {
          unsubscribeSpendings()
        })  
        const unsubscribeMonthlyTrans = firebase.firestore().collection('monthly-trans').onSnapshot(docs => {
          let monthlyTrans: iMonthlyTrans[] = []
          docs.forEach(doc => {
            monthlyTrans.push({...doc.data(), id:doc.id})
          })
          dispatch({type: 'SET_MONTHLY_TRANS', payload: monthlyTrans})
        }, err => {
          unsubscribeMonthlyTrans()
        })  
        const unsubscribeLogs = firebase.firestore().collection('logs').onSnapshot(docs => {
          let logs: iLog[] = []
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
    <StoreContext.Provider value={{state, dispatch}}>
      {props.children}
    </StoreContext.Provider>
  )
}
 
export default Store

