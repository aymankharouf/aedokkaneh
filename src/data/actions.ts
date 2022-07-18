import { setup } from './config'
import firebase from './firebase'
import labels from './labels'
import { Advert, BasketPack, Category, Customer, Region, Log, MonthlyOperation, Notification, Order, OrderPack, Pack, PackPrice, Product, Purchase, Rating, Spending, Stock, Store, Country, Err, PurchasePack, StoreTrans } from "./types"

export const getMessage = (path: string, error: Err) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser?.uid,
      error: errorCode,
      page: path,
      time: new Date()
    })
  }
  return labels[errorCode] || labels['unknownError']
}

export const addQuantity = (q1: number, q2: number, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
}

export const quantityText = (quantity: number, weight?: number): string => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}


export const addCountry = (country: Country) => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayUnion(country)
  }, { merge: true })
}

export const deleteCountry = (countryId: string, countries: Country[]) => {
  const values = countries.filter(c => c.id !== countryId)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const editCountry = (country: Country, countries: Country[]) => {
  const values = countries.filter(c => c.id !== country.id)
  values.push(country)
  firebase.firestore().collection('lookups').doc('c').update({
    values
  })
}

export const addRegion = (region: Region) => {
  firebase.firestore().collection('lookups').doc('r').set({
    values: firebase.firestore.FieldValue.arrayUnion(region)
  }, { merge: true })
}

export const editRegion = (region: Region, regions: Region[]) => {
  const values = regions.slice()
  const regionIndex = values.findIndex(r => r.id === region.id)
  values.splice(regionIndex, 1, region)
  firebase.firestore().collection('lookups').doc('r').update({
    values
  })
}

export const deleteLog = (log: Log) => {
  firebase.firestore().collection('logs').doc(log.id).delete()
}

export const approveStoreTrans = (trans: StoreTrans, storeTrans: StoreTrans[], packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const otherTrans = storeTrans.filter(t => t.storeId === trans.storeId && t.time !== trans.time)
  otherTrans.push({
    ...trans,
    status: 'a'
  })
  const result = otherTrans.map(t => {
    const { storeId, ...others } = t
    return others
  })
  const storeRef = firebase.firestore().collection('stores').doc(trans.storeId)
  batch.update(storeRef, {
    trans: result
  })
  const storePack = {
    packId: trans.packId,
    storeId: trans.storeId,
    price: trans.newPrice,
    isActive: trans.newPrice !== 0,
    lastUpdate: new Date()
  }
  if (trans.oldPrice === 0) addPackPrice(storePack, packPrices, packs, batch)
  else if (trans.newPrice === 0) editPrice(storePack, packPrices, packs, 'd', batch)
  else editPrice(storePack, packPrices, packs, 'e', batch)
  batch.commit()
}

export const deleteStoreTrans = (trans: StoreTrans, storeTrans: StoreTrans[]) => {
  const otherTrans = storeTrans.filter(t => t.storeId === trans.storeId && t.time !== trans.time)
  const result = otherTrans.map(t => {
    const { storeId, ...others } = t
    return others
  })
  firebase.firestore().collection('stores').doc(trans.storeId).update({
    trans: result
  })
}

export const addAdvert = async (advert: Advert, image?: File) => {
  const advertRef = firebase.firestore().collection('adverts').doc()
  let url = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + advertRef.id + ext).put(image)
    url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  advert.imageUrl = url
  advertRef.set(advert)
}

export const editAdvert = async (advert: Advert, image?: File) => {
  const { id, ...others } = advert
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('adverts/' + id + ext).put(image)
    const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others.imageUrl = url
  }
  firebase.firestore().collection('adverts').doc(id).update(others)
}

export const deleteAdvert = async (advert: Advert) => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
  if (advert.imageUrl) {
    const ext = advert.imageUrl.slice(advert.imageUrl.lastIndexOf('.'), advert.imageUrl.indexOf('?'))
    await firebase.storage().ref().child('adverts/' + advert.id + ext).delete()
  }
}

export const updateAdvertStatus = (advert: Advert, adverts: Advert[]) => {
  const batch = firebase.firestore().batch()
  let advertRef = firebase.firestore().collection('adverts').doc(advert.id)
  batch.update(advertRef, {
    isActive: !advert.isActive
  })
  if (!advert.isActive) {
    const activeAdvert = adverts.find(a => a.isActive)
    if (activeAdvert) {
      advertRef = firebase.firestore().collection('adverts').doc(activeAdvert.id)
      batch.update(advertRef, {
        isActive: false
      })
    }
  }
  batch.commit()
}

export const addCategory = (category: Category) => {
  firebase.firestore().collection('lookups').doc('g').set({
    values: firebase.firestore.FieldValue.arrayUnion(category)
  }, { merge: true })
}

export const editCategory = (category: Category, categories: Category[]) => {
  const values = categories.filter(c => c.id !== category.id)
  values.push(category)
  firebase.firestore().collection('lookups').doc('g').update({
    values
  })
}
export const deleteCategory = (categoryId: string, categories: Country[]) => {
  const values = categories.filter(c => c.id !== categoryId)
  firebase.firestore().collection('lookups').doc('g').update({
    values
  })
}
export const login = (email: string, password: string) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const registerUser = async (email: string, password: string) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password)
  return firebase.auth().currentUser?.updateProfile({
    displayName: 'a'
  })
}

export const resolvePasswordRequest = (requestId: string) => {
  firebase.firestore().collection('password-requests').doc(requestId).delete()
}

export const blockCustomer = async (customer: Customer) => {
  firebase.firestore().collection('customers').doc(customer.id).update({
    isBlocked: true
  })
}

export const editCustomer = (customer: Customer) => {
  const { id, ...others } = customer
  firebase.firestore().collection('customers').doc(id).update({
    ...others,
  })
}

export const approveCustomer = (customer: Customer) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = customer
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.update(customerRef, {
    ...others,
  })
  if (customer.storeId) {
    const storeRef = firebase.firestore().collection('stores').doc(customer.storeId)
    batch.update(storeRef, {
      userId: id
    })
  }
  batch.commit()
}

export const editStore = (store: Store) => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const productOfText = (trademark: string, country: string) => {
  return trademark ? `${labels.productFrom} ${trademark}${country ? '-' + country : ''}` : (country ? `${labels.productOf} ${country}` : '')
}

export const addProduct = async (product: Product, image?: File) => {
  const productRef = firebase.firestore().collection('products').doc()
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + productRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  }
  product.imageUrl = imageUrl
  productRef.set(product)
}

export const editProduct = async (product: Product, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = product
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others.imageUrl = imageUrl
  }
  const productRef = firebase.firestore().collection('products').doc(id)
  batch.update(productRef, others)
  let affectedPacks = packs.filter(p => p.product.id === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      product
    })
  })
  batch.commit()
}

export const deleteProduct = async (product: Product) => {
  if (product.imageUrl) {
    const ext = product.imageUrl.slice(product.imageUrl.lastIndexOf('.'), product.imageUrl.indexOf('?'))
    await firebase.storage().ref().child('products/' + product.id + ext).delete()
  }
  firebase.firestore().collection('products').doc(product.id).delete()
}

export const archiveProduct = (product: Product, packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const productRef = firebase.firestore().collection('products').doc(product.id)
  batch.update(productRef, {
    isArchived: true
  })
  const affectedPacks = packs.filter(p => p.product.id === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isArchived: true
    })
  })
  batch.commit()
}

const getMinPrice = (storePack: PackPrice, packPrices: PackPrice[]) => {
  const packStores = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId && p.price > 0 && p.isActive)
  if (storePack.isActive) {
    packStores.push(storePack)
  }
  const prices = packStores.map(s => s.price)
  return packStores.length > 0 ? Math.min(...prices) : 0
}

export const deletePack = (packId: string) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const addPack = async (pack: Pack) => {
  firebase.firestore().collection('packs').doc().set(pack)
}

export const editPack = async (newPack: Pack, packs: Pack[]) => {
  const { id, ...others } = newPack
  firebase.firestore().collection('packs').doc(id).update(others)
}

export const addPackPrice = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const { storeId, ...others } = storePack
  const storeRef = firebase.firestore().collection('stores').doc(storeId)
  newBatch.update(storeRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  const pack = packs.find(p => p.id === storePack.packId)!
  const price = getMinPrice(storePack, packPrices)
  if (pack.price !== price) {
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    newBatch.update(packRef, {
      price
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const editPrice = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], type: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const otherPrices = packPrices.filter(p => p.storeId === storePack.storeId && p.packId !== storePack.packId)
  if (type !== 'd') otherPrices.push(storePack)
  const prices = otherPrices.map(p => {
    const { storeId, ...others } = p
    return others
  })
  const storeRef = firebase.firestore().collection('stores').doc(storePack.storeId)
  newBatch.update(storeRef, {
    prices
  })
  const pack = packs.find(p => p.id === storePack.packId)!
  const price = getMinPrice(storePack, packPrices)
  if (pack.price !== price) {
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    newBatch.update(packRef, {
      price
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const sendNotification = (userId: string, title: string, text: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(userId)
  newBatch.update(customerRef, {
    notifications: firebase.firestore.FieldValue.arrayUnion({
      id: Math.random().toString(),
      title,
      text,
      status: 'n',
      time: new Date()
    })
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const deleteNotification = (notification: Notification, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.userId === notification.userId && n.id !== notification.id)
  const result = otherNotifications.map(n => {
    const { userId, ...others } = n
    return others
  })
  firebase.firestore().collection('customers').doc(notification.userId).update({
    notifications: result
  })
}

export const addSpending = (spending: Spending) => {
  firebase.firestore().collection('spendings').add(spending)
}

export const editSpending = (spending: Spending) => {
  const { id, ...others } = spending
  firebase.firestore().collection('spendings').doc(id).update(others)
}

const packStockIn = (batch: firebase.firestore.WriteBatch, pack: PurchasePack, stocks: Stock[], type: string, refId?: string) => {
  const newBatch = batch || firebase.firestore().batch()
  let stock = stocks.find(s => s.id === pack.packId)
  const stockRef = firebase.firestore().collection('stocks').doc(pack.packId)
  let newStock: Stock
  const newTrans = {
    type,
    quantity: pack.quantity,
    weight: pack.weight,
    price: pack.price,
    time: new Date().getTime(),
    refId: refId || ''
  }
  if (stock) {
    const avgPrice = Math.round((stock.quantity * stock.price + pack.quantity * pack.price) / addQuantity(pack.quantity, stock.quantity))
    newStock = {
      ...stock,
      price: avgPrice,
      quantity: addQuantity(pack.quantity, stock.quantity),
      weight: addQuantity(pack.weight, stock.weight),
      trans: [...stock.trans!, newTrans]
    }
    const { id, ...others } = newStock
    newBatch.update(stockRef, others)
  } else {
    newStock = {
      price: pack.price,
      quantity: pack.quantity,
      weight: pack.weight,
      trans: [newTrans],
      isArchived: false
    }
    newBatch.set(stockRef, newStock)
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const unfoldStockPack = (stock: Stock, pack: Pack, stocks: Stock[], quantity: number, firstStockPack: PurchasePack, secondStockPack?: PurchasePack) => {
  const batch = firebase.firestore().batch()
  if (!pack.isOffer) return
  packStockOut(stock, quantity, 0, 'u', 0, '', batch)
  packStockIn(batch, firstStockPack, stocks, 'u')
  if (secondStockPack) packStockIn(batch, secondStockPack, stocks, 'u')
  batch.commit()
}

export const quantityDetails = (basketPack: OrderPack) => {
  let text = `${labels.quantity}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased, basketPack.weight)}`
  }
  return text
}

export const updateOrderStatus = (order: Order, type: string, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    trans: [...order.trans, { type, time: new Date().getTime() }]
  })
  let customerRef
  if (type === 'a') {
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      ordersCount: firebase.firestore.FieldValue.increment(1)
    })
    sendNotification(order.userId, labels.approval, labels.approveOrder, newBatch)
  } else if (type === 'd') {
    order.basket.forEach(p => {
      const productRef = firebase.firestore().collection('products').doc(p.pack.product.id)
      newBatch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(p.purchased)
      })
      const affectedPacks = packs.filter(pa => pa.product.id === p.pack.product.id)
      affectedPacks.forEach(ap => {
        const packRef = firebase.firestore().collection('packs').doc(ap.id)
        const product = { ...ap.product, sales: firebase.firestore.FieldValue.increment(p.purchased) }
        newBatch.update(packRef, {
          product
        })
      })
    })
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      deliveredOrdersCount: firebase.firestore.FieldValue.increment(1),
      orderLimit: setup.nextOrderLimit
    })
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const editOrder = (order: Order, basket: OrderPack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const changedPacks = basket.filter(p => p.quantity !== p.oldQuantity)
                          .map(p => {
                            return {
                              ...p,
                              gross: Math.round(p.price * p.quantity),
                            }
                          })
  const unChangedPacks = basket.filter(p => p.quantity === p.oldQuantity)
  const packBasket = [...unChangedPacks, ...changedPacks]
  const total = packBasket.reduce((sum, p) => sum + p.gross, 0)
  const fraction = total - Math.floor(total / 5) * 5
  const { id, ...others } = order
  const orderRef = firebase.firestore().collection('orders').doc(id)
  newBatch.update(orderRef, {
    ...others,
    basket: packBasket,
    total,
    fraction,
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const getArchivedPurchases = (month: number) => {
  const purchases: Purchase[] = []
  firebase.firestore().collection('purchases')
    .where('isArchived', '==', true)
    .where('archivedMonth', '==', month)
    .get().then(docs => {
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
    })
  return purchases
}

export const addMonthlyOperation = (operation: MonthlyOperation, orders: Order[], purchases: Purchase[]) => {
  const batch = firebase.firestore().batch()
  const operationRef = firebase.firestore().collection('monthly-operations').doc(operation.id.toString())
  batch.set(operationRef, operation)
  const month = (Number(operation.id) % 100) - 1
  const year = Math.trunc(Number(operation.id) / 100)
  const ordersToArchived = orders.filter(o => ['s', 'r', 'd', 'c', 'm', 'u', 'i'].includes(o.status) && (o.lastUpdate).getFullYear() === year && (o.lastUpdate).getMonth() === month)
  ordersToArchived.forEach(o => {
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      isArchived: true,
      archivedMonth: operation.id
    })
  })
  const purchasesToArchived = purchases.filter(p => (p.time).getFullYear() === year && (p.time).getMonth() === month)
  purchasesToArchived.forEach(p => {
    const purchaseRef = firebase.firestore().collection('purchases').doc(p.id)
    batch.update(purchaseRef, {
      isArchived: true,
      archivedMonth: operation.id
    })
  })
  batch.commit()
}

export const completeOrderPack = (pack: Pack, order: Order, weight: number, overPricedPermission: boolean, stock?: Stock) => {
  const batch = firebase.firestore().batch()
  const basket = order.basket.slice()
  const orderPackIndex = basket.findIndex(p => p.pack.id === pack.id)
  const price = (stock?.price || 0) > basket[orderPackIndex].price && overPricedPermission ? (stock?.price || 0) : basket[orderPackIndex].price
  const quantity = pack.quantityType === 'wo' ? weight : Math.min(basket[orderPackIndex].quantity, stock?.quantity || 0)
  let status = 'e', fraction, profit = 0, total
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    status: 'e',
    purchased: quantity,
    weight,
    actual: (stock?.price || 0),
    overPriced: (stock?.price || 0) > basket[orderPackIndex].price && overPricedPermission ? true : false,
    gross: Math.round(price * weight || quantity),
  })

  total = basket.reduce((sum, p) => sum + p.gross, 0)
  fraction = total - Math.floor(total / 5) * 5
  if (basket.length === basket.filter(p => p.status === 'e').length) {
    status = 'f'
    profit = basket.reduce((sum, p) => sum + Math.floor(((p.actual > p.price && p.overPriced ? p.actual : p.price) - p.actual) * (p.weight || p.purchased)), 0)
  }
  const trans = status === 'f' ? [...order.trans, { type: 'f', time: new Date().getTime() }] : order.trans.slice()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fraction,
    status,
    trans
  })
  if (stock) {
    packStockOut(stock, stock.quantity, stock.weight, 's', 0, order.id, batch)
  }
  batch.commit()
}

export const returnPack = (pack: Pack, order: Order, stocks: Stock[]) => {
  const batch = firebase.firestore().batch()
  const basket = order.basket.slice()
  console.log('basket == ', basket)
  const orderPackIndex = basket.findIndex(p => p.pack.id === pack.id)
  let status = 'e', fraction, total
  const stockPack = {
    packId: pack.id!,
    price: basket[orderPackIndex].price,
    quantity: basket[orderPackIndex].quantity,
    weight: basket[orderPackIndex].weight
  }
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    status: 'n',
    purchased: 0,
    weight: 0,
    actual: 0,
    gross: Math.round(basket[orderPackIndex].price * basket[orderPackIndex].quantity),
  })
  total = basket.reduce((sum, p) => sum + p.gross, 0)
  fraction = total - Math.floor(total / 5) * 5
  if (basket.length === basket.filter(p => p.status === 'n').length) {
    status = 'a'
  } else {
    status = 'e'
  }
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit: 0,
    total,
    fraction,
    status,
  })
  packStockIn(batch, stockPack, stocks, 'r', order.id)
  batch.commit()
}

export const returnPurchase = (stockPack: Stock, quantity: number, weight: number, purchase: Purchase) => {
  const batch = firebase.firestore().batch()
  let packBasket = purchase.basket.find(p => p.packId === stockPack.id)!
  packStockOut(stockPack, quantity, weight, 'r', packBasket.price, purchase.id, batch)
  const newQuantity = addQuantity(packBasket?.quantity || 0, -1 * quantity)
  const newWeight = newQuantity === 0 ? 0 : addQuantity(packBasket?.weight || 0, -1 * weight)
  const otherPacks = purchase.basket.filter(p => p.packId !== stockPack.id)
  if (newQuantity > 0) {
    packBasket = {
      ...packBasket,
      quantity: newQuantity,
      weight: newWeight
    }
    otherPacks.push(packBasket)
  }
  const total = otherPacks.reduce((sum, p) => sum + p.price * (p.weight || p.quantity), 0)
  const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
  if (otherPacks.length > 0) {
    batch.update(purchaseRef, {
      basket: otherPacks,
      total
    })
  } else {
    batch.delete(purchaseRef)
  }
  batch.commit()
}

export const packStockOut = (stockPack: Stock, quantity: number, weight: number, type: string, price?: number, refId?: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const newQuantity = addQuantity(stockPack?.quantity || 0, -1 * quantity)
  const newWeight = newQuantity === 0 ? 0 : addQuantity(stockPack?.weight || 0, -1 * weight)
  let newPrice = newQuantity === 0 ? 0 : stockPack.price
  if (type === 'r' && newQuantity > 0) {
    newPrice = Math.round((stockPack.quantity * stockPack.price - quantity * (price || 0)) / addQuantity(stockPack.quantity, -1 * quantity))
  }
  const stockRef = firebase.firestore().collection('stocks').doc(stockPack.id)
  const newTrans = {
    type,
    quantity: -1 * quantity,
    weight: -1 * weight,
    price: type === 'r' ? price : stockPack.price,
    time: new Date().getTime(),
    refId: refId || ''
  }
  const newStockPack = {
    ...stockPack,
    quantity: newQuantity,
    weight: newWeight,
    price: newPrice,
    trans: [...stockPack.trans!, newTrans]
  }
  const { id, ...others } = newStockPack
  newBatch.update(stockRef, others)
  if (!batch) {
    newBatch.commit()
  }
}

export const confirmPurchase = (basket: BasketPack[], storeId: string, stocks: Stock[], total: number) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const purchaseBasket = basket.map(p => ({
    packId: p.pack?.id!,
    price: p.price,
    quantity: p.quantity,
    weight: p.weight
  }))
  batch.set(purchaseRef, {
    storeId,
    basket: purchaseBasket,
    total,
    isArchived: false,
    time: new Date()
  })
  purchaseBasket.forEach(p => {
    packStockIn(batch, p, stocks, 'p', purchaseRef.id)
  })
  batch.commit()
}

export const getArchivedProducts = async () => {
  const products: Product[] = []
  await firebase.firestore().collection('products')
    .where('isArchived', '==', true)
    .get().then(docs => {
      docs.forEach(doc => {
        products.push({
          id: doc.id,
          name: doc.data().name,
          alias: doc.data().alias,
          description: doc.data().description,
          trademark: doc.data().trademark,
          countryId: doc.data().countryId,
          categoryId: doc.data().categoryId,
          imageUrl: doc.data().imageUrl,
          sales: doc.data().sales,
          rating: doc.data().rating,
          ratingCount: doc.data().ratingCount,
          isArchived: doc.data().isArchived
        })
      })
    })
  return products
}

export const getArchivedPacks = async () => {
  const packs: Pack[] = []
  await firebase.firestore().collection('packs')
    .where('isArchived', '==', true)
    .get().then(docs => {
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          price: doc.data().price,
          unitsCount: doc.data().unitsCount,
          quantityType: doc.data().quantityType,
          isOffer: doc.data().isOffer
        })
      })
    })
  return packs
}

export const setDeliveryTime = (orderId: string, deliveryTime: string) => {
  firebase.firestore().collection('orders').doc(orderId).update({
    deliveryTime,
    lastUpdate: new Date()
  })
}

export const addStore = (store: Store) => {
  firebase.firestore().collection('stores').add(store)
}

export const changePassword = async (oldPassword: string, newPassword: string) => {
  let user = firebase.auth().currentUser
  if (!user) return
  await firebase.auth().signInWithEmailAndPassword(user.email!, oldPassword)
  return firebase.auth().currentUser?.updatePassword(newPassword)
}

export const approveRating = (rating: Rating, ratings: Rating[], products: Product[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const otherRating = ratings.filter(r => r.userId === rating.userId && r.productId !== rating.productId)
  otherRating.push({
    ...rating,
    status: 'a'
  })
  const newRatings = otherRating.map(r => {
    const { userId, ...others } = r
    return others
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userId)
  batch.update(customerRef, {
    ratings: newRatings
  })
  const product = products.find(p => p.id === rating.productId)!
  const oldRating = product.rating
  const ratingCount = product.ratingCount
  const newRating = Math.round((oldRating * ratingCount + rating.value) / (ratingCount + 1))
  const productRef = firebase.firestore().collection('products').doc(rating.productId)
  batch.update(productRef, {
    rating: newRating,
    ratingCount: ratingCount + 1
  })
  const affectedPacks = packs.filter(p => p.product.id === rating.productId)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      rating: newRating,
      ratingCount: ratingCount + 1
    })
  })
  batch.commit()
}

export const getArchivedOrders = (month: number) => {
  const orders: Order[] = []
  firebase.firestore().collection('orders')
    .where('isArchived', '==', true)
    .where('archivedMonth', '==', month)
    .get().then(docs => {
      docs.forEach(doc => {
        orders.push({
          id: doc.id,
          userId: doc.data().userId,
          status: doc.data().status,
          total: doc.data().total,
          deliveryTime: doc.data().deliveryTime,
          deliveryFees: doc.data().deliveryFees,
          fraction: doc.data().fraction,
          profit: doc.data().profit,
          lastUpdate: doc.data().lastUpdate.toDate(),
          basket: doc.data().basket,
          trans: doc.data().trans
        })
      })
    })
  return orders
}
