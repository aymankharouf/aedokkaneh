import firebase from './firebase'
import labels from './labels'
import { Advert, Alarm, Basket, BasketPack, Category, CustomerInfo, Region, Log, MonthlyOperation, Notification, Order, OrderBasketPack, Pack, PackPrice, Product, Purchase, Rating, RequestedPack, ReturnBasket, Spending, StockPack, StockOperation, Store, StorePayment, UserInfo, Country, Err } from "./types"
import { randomColors, setup } from './config'
import moment from 'moment'

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
  }, {merge: true})
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
  }, {merge: true})
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
  }, {merge: true})
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

export const permitUser = async (userId: string, storeId: string, users: UserInfo[], stores: Store[]) => {
  const userInfo = users.find(u => u.id === userId)!
  let name
  if (storeId) {
    name = `${userInfo.name}-${stores.find(s => s.id === storeId)?.name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId,
      name
    })  
  } else {
    name = `${userInfo.name}:${userInfo.mobile}`
    await firebase.firestore().collection('customers').doc(userId).update({
      storeId: firebase.firestore.FieldValue.delete(),
      name
    })  
  }
  const colors = userInfo.colors.map(c => randomColors.find(rc => rc.name === c)!.id)
  const password = colors.join('')
  await firebase.auth().signInWithEmailAndPassword(userInfo.mobile + '@gmail.com', userInfo.mobile.substring(9, 2) + password)
  await firebase.auth().currentUser?.updateProfile({
    displayName: storeId
  })
  return firebase.auth().signOut()
}

export const deleteUser = async (user: UserInfo, orders: Order[]) => {
  const colors = user.colors.map(c => randomColors.find(rc => rc.name === c)!.id)
  const password = colors.join('')
  await firebase.firestore().collection('users').doc(user.id).delete()
  const userOrders = orders.filter(o => o.userId === user.id)
  for (let o of userOrders) {
    await firebase.firestore().collection('orders').doc(o.id).delete()
  }
  await firebase.auth().signInWithEmailAndPassword(user.mobile + '@gmail.com', user.mobile.substring(9, 2) + password)
  return firebase.auth().currentUser?.delete()
}

export const approveUser = (id: string, name: string, mobile: string, regionId: string, storeName: string, address: string, regions: Region[]) => {
  const batch = firebase.firestore().batch()
  const deliveryFees = regions.find(r => r.id === regionId)?.fees || 0
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name: `${name}:${mobile}`,
    orderLimit: setup.orderLimit,
    isBlocked: false,
    storeName,
    storeId: '',
    address,
    deliveryFees,
    mapPosition: '',
    ordersCount: 0,
    deliveredOrdersCount: 0,
    returnedCount: 0,
    deliveredOrdersTotal: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name,
    regionId,
    storeName: ''
  })
  batch.commit()
}

export const editCustomer = (customer: CustomerInfo, name: string, regionId: string, mobile: string, storeId: string, stores: Store[]) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = customer
  const customerRef = firebase.firestore().collection('customers').doc(id)
  const storeName = storeId ? `-${stores.find(s => s.id === storeId)?.name}`: ''
  batch.update(customerRef, {
    ...others,
    name: `${name}${storeName}:${mobile}`,
  })
  const userRef = firebase.firestore().collection('users').doc(id)
  batch.update(userRef, {
    name,
    regionId
  })
  batch.commit()
}

export const addStock = () => {
  firebase.firestore().collection('stores').doc('s').set({
    name: labels.stockName,
    type: '1',
    isActive: true,
    allowReturn: true,
    discount: 0,
    mobile: '',
    mapPosition: '',
    openTime: '',
    address: '',
    balances: [],
    time: new Date()
  })
}

export const editStore = (store: Store) => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const productOfText = (trademark: string, country: string) => {
  return trademark ? `${labels.productFrom} ${trademark}-${country}` : `${labels.productOf} ${country}`
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

export const editProduct = async (product: Product, oldName: string, packs: Pack[], image?: File) => {
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
  let affectedPacks = packs.filter(p => p.productId === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    let url = ''
    if (image && ((!p.subPackId && !p.specialImage) || (p.subPackId && !p.specialImage && packs.find(sp => sp.id === p.subPackId)?.specialImage === false))) {
      url = imageUrl
    }
    const packInfo = {
      productName: product.name,
      productAlias: product.alias,
      productDescription: product.description,
      categoryId: product.categoryId,
      country: product.countryId,
      trademark: product.trademark,
      sales: product.sales,
      rating: product.rating,
      ratingCount: product.ratingCount,
      imageUrl: url
    }
    batch.update(packRef, packInfo)
  })
  if (product.name !== oldName) {
    affectedPacks = packs.filter(p => packs.find(bp => bp.id === p.bonusPackId && bp.productId === id))
    affectedPacks.forEach(p => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusProductName: product.name,
      })
    })
  }
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
  const affectedPacks = packs.filter(p => p.productId === product.id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    batch.update(packRef, {
      isArchived: true
    })
  })
  batch.commit()
}

export const getPackStores = (pack: Pack, packPrices: PackPrice[], packs: Pack[], basketStockQuantity?: number) => {
  const packStores = packPrices.filter(p => (p.packId === pack.id || packs.find(pa => pa.id === p.packId && pa.forSale && (pa.subPackId === pack.id || pa.bonusPackId === pack.id))) && (p.storeId !== 's' || addQuantity(p.quantity, -1 * (basketStockQuantity || 0)) > 0))
  return packStores.map(s => {
    let packId = '', unitPrice = 0, unitCost = 0, price, cost, subQuantity = 0, offerInfo, isOffer = false
    if (s.packId === pack.id) {
      packId = s.packId
      price = s.price
      cost = s.cost
      unitPrice = s.price
      unitCost = s.cost
      isOffer = pack.isOffer
    } else {
      offerInfo = packs.find(p => p.id === s.packId && p.subPackId === pack.id)
      price = s.price
      cost = s.cost
      if (offerInfo) {
        packId = offerInfo.id!
        unitPrice = Math.round(s.price / offerInfo.subQuantity * offerInfo.subPercent * (1 + setup.profit))
        unitCost = Math.round(s.cost / offerInfo.subQuantity * offerInfo.subPercent)
        subQuantity = offerInfo.subQuantity
        isOffer = offerInfo.isOffer
      } else {
        offerInfo = packs.find(p => p.id === s.packId && p.bonusPackId === pack.id)
        if (offerInfo) {
          packId = offerInfo.id!
          unitPrice = Math.round(s.price / offerInfo.bonusQuantity * offerInfo.bonusPercent * (1 + setup.profit))
          unitCost = Math.round(s.cost / offerInfo.bonusQuantity * offerInfo.bonusPercent)
          subQuantity = offerInfo.bonusQuantity
          isOffer = offerInfo.isOffer
        }
      }
    }
    return {
      ...s,
      packId,
      price,
      cost,
      subQuantity,
      unitPrice,
      unitCost,
      isOffer
    }
  })
}

export const changeStorePackStatus = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === storePack.packId)!
  const otherPrices = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId)
  const newStorePack = {
    ...storePack,
    isActive: !storePack.isActive
  }
  otherPrices.push(newStorePack)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  newBatch.update(packRef, {
    prices
  })
  let actionType
  if (storePack.isActive && storePack.price === pack.price) {
    actionType = 'd'
  } else if (newStorePack.isActive && pack.forSale && (newStorePack.price <= pack.price || pack.price === 0)) {
    actionType = 'a'
  }
  if (actionType) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(actionType === 'd' ? storePack : newStorePack, pack, packPrices, actionType === 'd' ? true : false)    
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) { 
    const subStorePack = packPrices.find(p => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      changeStorePackStatus(subStorePack, packPrices, packs, newBatch)
    }
  }
  if (!batch) {
    newBatch.commit()
  }
}

const getMinPrice = (storePack: PackPrice, pack: Pack, packPrices: PackPrice[], isDeletion: boolean) => {
  const packStores = packPrices.filter(p => p.packId === pack.id && p.storeId !== storePack.storeId && p.price > 0 && p.isActive)
  if (!isDeletion && storePack.isActive){
    packStores.push(storePack)
  }
  let minPrice = 0, weightedPrice = 0, offerEnd = null, minStoreId = ''
  if (packStores.length > 0){
    const prices = packStores.map(s => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = minPrice / pack.unitsCount
    packStores.sort((p1, p2) => (p2.offerEnd ? moment(p2.offerEnd) : moment().add(1000, 'days')) > (p1.offerEnd ? moment(p1.offerEnd) : moment().add(1000, 'days')) ? 1 : -1)
    offerEnd = packStores.find(s => s.price === minPrice)!.offerEnd
    if (packStores.filter(s => s.price === minPrice).length === 1) {
      minStoreId = packStores.find(s => s.price === minPrice)!.storeId
    }
  }
  return {minPrice, minStoreId, weightedPrice, offerEnd}
}

export const deleteStorePack = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === storePack.packId)!
  const otherPrices = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices
  })
  if (storePack.price === pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, true)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) {
    const subStorePack = packPrices.find(p => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      deleteStorePack(subStorePack, packPrices, packs, newBatch)
    }
  } 
  if (!batch) {
    newBatch.commit()
  }
}

export const refreshPackPrice = (pack: Pack, packPrices: PackPrice[]) => {
  let packStores = packPrices.filter(p => p.packId === pack.id && p.price > 0 && p.isActive)
  let minPrice = 0, weightedPrice, offerEnd, minStoreId = ''
  if (packStores.length === 0){
    minPrice = 0
    weightedPrice = 0
    offerEnd = ''
  } else {
    const prices = packStores.map(s => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = Math.round(minPrice / pack.unitsCount)
    packStores.sort((p1, p2) => (p2.offerEnd ? moment(p2.offerEnd) : moment().add(1000, 'days')) > (p1.offerEnd ? moment(p1.offerEnd) : moment().add(1000, 'days')) ? 1 : -1)
    offerEnd = packStores.find(s => s.price === minPrice)!.offerEnd
    if (packStores.filter(s => s.price === minPrice).length === 1) {
      minStoreId = packStores.find(s => s.price === minPrice)!.storeId
    }
  }  
  firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    offerEnd,
    minStoreId
  })
}

export const deletePack = (packId: string) => {
  firebase.firestore().collection('packs').doc(packId).delete()
}

export const addPack = async (pack: Pack, image?: File, subPackInfo?: Pack) => {
  const packRef = firebase.firestore().collection('packs').doc()
  let imageUrl, specialImage
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + packRef.id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    specialImage = true
  } else {
    imageUrl = subPackInfo?.imageUrl || pack.imageUrl
    specialImage = false
  }

  packRef.set({
    ...pack,
    imageUrl,
    specialImage
  })
}

export const editPack = async (newPack: Pack, oldPack: Pack, packs: Pack[], image?: File) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = newPack
  let imageUrl = ''
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('packs/' + id + ext).put(image)
    imageUrl = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
    others.specialImage = true
    others.imageUrl = imageUrl
  } 
  const packRef = firebase.firestore().collection('packs').doc(id)
  batch.update(packRef, others)
  let affectedPacks = packs.filter(p => p.subPackId === id)
  affectedPacks.forEach(p => {
    const packRef = firebase.firestore().collection('packs').doc(p.id)
    const packInfo = {
      subPackName: newPack.name,
      unitsCount: p.subQuantity * newPack.unitsCount,
      isDivided: newPack.isDivided,
      byWeight: newPack.byWeight,
      closeExpired: newPack.closeExpired,
      imageUrl: image && !p.specialImage ? imageUrl : ''
    }
    batch.update(packRef, packInfo)
  })
  if (newPack.name !== oldPack.name) {
    affectedPacks = packs.filter(p => p.bonusPackId === id)
    affectedPacks.forEach(p => {
      const packRef = firebase.firestore().collection('packs').doc(p.id)
      batch.update(packRef, {
        bonusPackName: newPack.name
      })
    })
  }
  batch.commit()
}

export const addPackPrice = (storePack: PackPrice, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const { packId, ...others } = storePack
  const pack = packs.find(p => p.id === packId)!
  let packRef = firebase.firestore().collection('packs').doc(pack.id)
  newBatch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others)
  })
  if (storePack.isActive && pack.forSale && (storePack.price <= pack.price || pack.price === 0)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, false)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) {
    let subStorePack = packPrices.find(p => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (!subStorePack) {
      const subStorePack = {
        packId: pack.subPackId,
        storeId: storePack.storeId,
        cost: Math.round(storePack.cost / pack.subQuantity),
        price: Math.round(storePack.price / pack.subQuantity),
        offerEnd: storePack.offerEnd,
        isActive: storePack.isActive,
        isAuto: true,
        time: new Date(),
        quantity: 0,
        weight: 0
      }
      addPackPrice(subStorePack, packPrices, packs, batch)  
    }
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const editPrice = (storePack: PackPrice, oldPrice: number, packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const pack = packs.find(p => p.id === storePack.packId)!
  const otherPrices = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId)
  otherPrices.push(storePack)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  let packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  newBatch.update(packRef, {
    prices
  })
  if (storePack.isActive && pack.forSale && (storePack.price <= pack.price || pack.price === 0 || pack.price === oldPrice)) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(storePack, pack, packPrices, false)
    packRef = firebase.firestore().collection('packs').doc(pack.id)
    newBatch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
  if (!pack.forSale) { 
    let subStorePack = packPrices.find(p => p.storeId === storePack.storeId && p.packId === pack.subPackId)
    if (subStorePack) {
      const subStorePackOldPrice = subStorePack.price
      subStorePack = {
        ...subStorePack,
        cost: Math.round(storePack.cost / pack.subQuantity),
        price: Math.round(storePack.price / pack.subQuantity),
      }
      editPrice(subStorePack, subStorePackOldPrice, packPrices, packs, newBatch)
    }
  } 
  if (!batch) {
    newBatch.commit()
  }
}

export const sendNotification = (userId: string, title: string, text: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(userId)
  newBatch.update(userRef, {
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
    const {userId, ...others} = n
    return others
  })
  firebase.firestore().collection('users').doc(notification.userId).update({
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

export const stockOut = (basket: BasketPack[], orders: Order[], packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const operationRef = firebase.firestore().collection('stock-operations').doc()
  const packBasket = basket.map(p => {
    const pack = {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost,
      weight: p.weight || 0
    }
    return pack
  })
  const total = packBasket.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0)
  batch.set(operationRef, {
    basket: packBasket,
    type: 'o',
    total,
    isArchived: false,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)!
      updateOrder(batch, 's', order, p)
    } else {
      let packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.time > o2.time ? 1 : -1)
      updateOrders(batch, 's', packOrders, p)
    }
    const pack = {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost,
      actual: p.actual,
      weight: p.weight || 0
    }
    packStockOut(batch, pack, packPrices, packs)
  })
  batch.commit()
}

export const updateOrder = (batch: firebase.firestore.WriteBatch, storeId: string, order: Order, basketPack: BasketPack, purchaseId?: string) => {
  const basket = order.basket.slice()
  const orderPackIndex = basket.findIndex(p => p.packId === basketPack.packId)
  const orderPack = basket[orderPackIndex]
  let actual
  if (orderPack.price < basketPack.actual && basketPack.exceedPriceType === 'o') {
    actual = orderPack.price
  } else {
    actual = basketPack.actual
  }
  let orderStatus = 'e'
  const orderPackQuantity = orderPack.weight || 0
  const newWeight = addQuantity(orderPack.weight || 0, basketPack.weight)
  const newPurchased = addQuantity(orderPack.purchased, basketPack.quantity)
  const avgCost = orderPackQuantity === 0 ? basketPack.cost : Math.round((orderPack.cost * orderPackQuantity + basketPack.cost * basketPack.weight) / newWeight)
  const avgActual = orderPackQuantity === 0 ? actual : Math.round((orderPack.actual * orderPackQuantity + basketPack.actual * basketPack.weight) / newWeight)
  let status = basketPack.isDivided ? 'f' : (orderPack.quantity === addQuantity(orderPack.purchased, basketPack.quantity) ? 'f' : 'p')
  const gross = status === 'f' ? Math.round(avgActual * newWeight) : Math.round(avgActual * newWeight) + Math.round(orderPack.price * addQuantity(orderPack.quantity, -1 * newPurchased))
  basket.splice(orderPackIndex, 1, {
    ...orderPack,
    purchased: newPurchased,
    storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
    cost: avgCost,
    actual: avgActual,
    gross,
    weight: newWeight,
    status,
    lastPurchaseId: purchaseId || '',
    lastPurchased: basketPack.quantity,
    lastWeight: basketPack.weight,
    prevStoreId: orderPack.storeId || ''
  })
  if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  const profit = basket.reduce((sum, p) => sum + (['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0), 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 5) * 5
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fraction,
    status: orderStatus,
    lastUpdate: new Date()
  })
}

export const updateOrders = (batch: firebase.firestore.WriteBatch, storeId: string, orders: Order[], basketPack: BasketPack, purchaseId?: string) => {
  let remaining = basketPack.quantity
  let orderPack, orderPackIndex, purchased, orderStatus, avgCost, avgActual, status
  let basket, profit, total, fixedFees, fraction, orderRef, actual, gross
  for (let o of orders){
    if (remaining <= 0) break
    basket = o.basket.slice()
    orderPackIndex = basket.findIndex(p => p.packId === basketPack.packId)
    orderPack = basket[orderPackIndex]
    if (orderPack.price < basketPack.actual && basketPack.exceedPriceType === 'o') {
      actual = orderPack.price
    } else {
      actual = basketPack.actual
    }
    orderStatus = 'e'
    if (remaining >= addQuantity(orderPack.quantity, -1 * orderPack.purchased)) {
      purchased = addQuantity(orderPack.quantity, -1 * orderPack.purchased)
    } else {
      purchased = remaining
    }
    avgCost = orderPack.purchased === 0 ? basketPack.cost : Math.round((orderPack.cost * orderPack.purchased + basketPack.cost * purchased) / addQuantity(orderPack.purchased, purchased))
    avgActual = orderPack.purchased === 0 ? actual : Math.round((orderPack.actual * orderPack.purchased + actual * purchased) / addQuantity(orderPack.purchased, purchased))
    status = orderPack.quantity === addQuantity(orderPack.purchased, purchased) ? 'f' : 'p'
    gross = status === 'f' ? Math.round(avgActual * addQuantity(orderPack.purchased, purchased)) : Math.round(avgActual * addQuantity(orderPack.purchased, purchased)) + Math.round(orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * purchased))
    basket.splice(orderPackIndex, 1, {
      ...orderPack, 
      purchased: addQuantity(orderPack.purchased, purchased),
      storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
      cost: avgCost,
      actual: avgActual,
      gross,
      status,
      lastPurchaseId: purchaseId || '',
      lastPurchased: purchased,
      prevStoreId: orderPack.storeId || ''
    })
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    profit = basket.reduce((sum, p) => sum + (['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0), 0)
    total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
    fixedFees = Math.round(setup.fixedFees * total)  
    fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
    orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      fraction,
      status: orderStatus,
      lastUpdate: new Date()
    })
    remaining -=  purchased
  }
  return remaining
}

const packStockOut = (batch: firebase.firestore.WriteBatch, basketPack: StockPack, packPrices: PackPrice[], packs: Pack[]) => {
  const stock = packPrices.find(s => s.packId === basketPack.packId && s.storeId === 's')!
  const pack = packs.find(p => p.id === basketPack.packId)!
  const otherPrices = packPrices.filter(p => p.packId === basketPack.packId && p.storeId !== 's')
  const packRef = firebase.firestore().collection('packs').doc(pack.id)
  const quantity = addQuantity(stock?.quantity || 0, -1 * basketPack.quantity)
  if (stock.weight) {
    otherPrices.push({
      ...stock,
      quantity,
      weight: quantity === 0 ? 0 : addQuantity(stock.weight, -1 * basketPack.weight)
    })
  } else {
    otherPrices.push({
      ...stock,
      price: quantity === 0 ? 0 : stock.price,
      cost: quantity === 0 ? 0 : stock.cost,
      quantity 
    })
  }
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  batch.update(packRef, {
    prices
  })
  if (stock.price === pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(stock, pack, packPrices, true)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const confirmPurchase = (basket: BasketPack[], orders: Order[], storeId: string, packPrices: PackPrice[], packs: Pack[], stores: Store[], total: number) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost,
      weight: p.weight || 0
    }
  })
  batch.set(purchaseRef, {
    storeId,
    type: 'p',
    basket: packBasket,
    total,
    isArchived: false,
    time: new Date()
  })
  updateStoreBalance(batch, storeId, total, new Date(), stores)
  let packsIn: BasketPack[] = []
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    let packOrders, remaining, packInfo: Pack, quantity, mainRemaining, subPack: BasketPack, pack = p
    packInfo = packs.find(pa => pa.id === p.packId)!
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find(o => o.id === p.orderId)!
        updateOrder(batch, storeId, order, p, purchaseRef.id)
      } else {
        packsIn.push(p)
      }
    } else {
      if (!packInfo.forSale) {
        packInfo = packs.find(pa => pa.id === packInfo.subPackId)!
        pack = {
          packId: packInfo.id!,
          quantity: p.quantity * packInfo.subQuantity,
          cost: Math.round(p.cost / packInfo.subQuantity * packInfo.subPercent),
          actual: Math.round(p.actual / packInfo.subQuantity * packInfo.subPercent),
          exceedPriceType: p.exceedPriceType,
          productName: packInfo.productName,
          productAlias: packInfo.productAlias,
          packName: packInfo.name,
          imageUrl: packInfo.imageUrl,
          price: Math.round(p.price / packInfo.subQuantity * packInfo.subPercent),
          weight: p.weight * packInfo.subQuantity,
          requested: 0,
          orderId: '',
          isOffer: packInfo.isOffer,
          isDivided: packInfo.isDivided,
          closeExpired: packInfo.closeExpired,
          refPackId: '',
          refPackQuantity: 0,
          refQuantity: 0
        }
      }
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === pack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
      packOrders.sort((o1, o2) => o1.time > o2.time ? 1 : -1)
      remaining = updateOrders(batch, storeId, packOrders, pack, purchaseRef.id)
      if (remaining > 0) {
        mainRemaining = remaining
        if (packInfo.subPackId) {
          subPack = {
            packId: packInfo.subPackId,
            quantity: remaining * packInfo.subQuantity,
            cost: Math.round(pack.cost / packInfo.subQuantity * packInfo.subPercent),
            actual: Math.round(pack.actual / packInfo.subQuantity * packInfo.subPercent * (1 + setup.profit)),
            exceedPriceType: pack.exceedPriceType,
            productName: packInfo.productName,
            productAlias: packInfo.productAlias,
            packName: packInfo.name,
            imageUrl: packInfo.imageUrl,
            price: Math.round(p.price / packInfo.subQuantity * packInfo.subPercent),
            weight: p.weight * packInfo.subQuantity,
            requested: 0,
            orderId: '',
            isOffer: packInfo.isOffer,
            isDivided: packInfo.isDivided,
            closeExpired: packInfo.closeExpired,
            refPackId: '',
            refPackQuantity: 0,
            refQuantity: 0
          }
          packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === subPack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
          packOrders.sort((o1, o2) => o1.time > o2.time ? 1 : -1)
          quantity = updateOrders(batch, storeId, packOrders, subPack, purchaseRef.id)
          if (quantity > 0) {
            mainRemaining = Math.min(mainRemaining, Math.trunc(quantity / packInfo.subQuantity))
            quantity = quantity % packInfo.subQuantity
            if (quantity > 0) {
              packsIn.push({...subPack, quantity})
            }
          }
          if (packInfo.bonusPackId){
            subPack = {
              packId: packInfo.bonusPackId,
              quantity: remaining * packInfo.bonusQuantity,
              cost: Math.round(p.cost / packInfo.bonusQuantity * packInfo.bonusPercent),
              actual: Math.round(p.actual / packInfo.bonusQuantity * packInfo.bonusPercent * (1 + setup.profit)),
              exceedPriceType: p.exceedPriceType,
              productName: packInfo.productName,
              productAlias: packInfo.productAlias,
              packName: packInfo.name,
              imageUrl: packInfo.imageUrl,
              price: Math.round(p.price / packInfo.subQuantity * packInfo.subPercent),
              weight: p.weight * packInfo.subQuantity,
              requested: 0,
              orderId: '',
              isOffer: packInfo.isOffer,
              isDivided: packInfo.isDivided,
              closeExpired: packInfo.closeExpired,
              refPackId: '',
              refPackQuantity: 0,
              refQuantity: 0
            }
            packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === subPack.packId && op.price === p.price && ['n', 'p'].includes(op.status)))
            packOrders.sort((o1, o2) => o1.time > o2.time ? 1 : -1)
            quantity = updateOrders(batch, storeId, packOrders, subPack, purchaseRef.id)
            if (quantity > 0) {
              mainRemaining = Math.min(mainRemaining, Math.trunc(quantity / packInfo.subQuantity))
              quantity = quantity % packInfo.subQuantity
              if (quantity > 0) {
                packsIn.push({...subPack, quantity})
              }
            }
          }
        }
        if (mainRemaining > 0) {
          packsIn.push({...pack, quantity: mainRemaining})
        }
      }
    }  
  })
  if (packsIn.length > 0) {
    stockIn(batch, 'p', packsIn, packPrices, packs, storeId, purchaseRef.id)
  }
  batch.commit()
}

export const updateStoreBalance = (batch: firebase.firestore.WriteBatch, storeId: string, amount: number, balanceDate: Date, stores: Store[]) => {
  const year = balanceDate.getFullYear()
  const month = balanceDate.getMonth() + 1
  const store = stores.find(s => s.id === storeId)!
  const balances = store.balances?.slice() || []
  const monthIndex = balances.findIndex(b => b.month === year * 100 + month)
  const monthBalance = {
    month: year * 100 + month,
    balance: monthIndex === -1 ? amount : balances[monthIndex].balance + amount
  }
  balances.splice(monthIndex === -1 ? balances.length : monthIndex, 1, monthBalance)
  const storeRef = firebase.firestore().collection('stores').doc(storeId)
  batch.update(storeRef, {
    balances
  })
}

const stockIn = (batch: firebase.firestore.WriteBatch, type: string, basket: StockPack[], packPrices: PackPrice[], packs: Pack[], storeId?: string, purchaseId?: string) => {
  const operationRef = firebase.firestore().collection('stock-operations').doc()
  const newBasket = basket.map(p => {
    return {
      packId: p.packId,
      quantity: p.quantity,
      cost: p.cost,
      actual: p.actual,
      price: p.actual === p.cost ? Math.round(p.cost * (1 + setup.profit)) : p.actual,
      weight: p.weight || 0
    }
  })
  const total = newBasket.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0)
  batch.set(operationRef, {
    basket: newBasket,
    storeId: storeId || '',
    purchaseId: purchaseId || '',
    type,
    total,
    isArchived: false,
    time: new Date()
  })
  newBasket.forEach(p => {
    packStockIn(batch, p, packPrices, packs)
  })
}

const packStockIn = (batch: firebase.firestore.WriteBatch, basketPack: StockPack, packPrices: PackPrice[], packs: Pack[]) => {
  let stock = packPrices.find(p => p.packId === basketPack.packId && p.storeId === 's')
  const pack = packs.find(p => p.id === basketPack.packId)!
  const otherPrices = packPrices.filter(p => p.packId === basketPack.packId && p.storeId !== 's')
  let packRef, newStock, avgPrice, avgCost
  if (stock) {
    if (stock.weight) {
      avgPrice = Math.round((stock.weight * stock.price + basketPack.weight * basketPack.price) / addQuantity(basketPack.weight, stock.weight))
      avgCost = Math.round((stock.weight * stock.cost + basketPack.weight * basketPack.cost) / addQuantity(basketPack.weight, stock.weight))
    } else {
      avgPrice = Math.round((stock.quantity * stock.price + basketPack.quantity * basketPack.price) / addQuantity(basketPack.quantity, stock.quantity))
      avgCost = Math.round((stock.quantity * stock.cost + basketPack.quantity * basketPack.cost) / addQuantity(basketPack.quantity, stock.quantity))  
    }
    newStock = {
      ...stock,
      price: avgPrice, 
      cost: avgCost,
      quantity: addQuantity(basketPack.quantity, stock.quantity), 
      weight: stock.weight ? addQuantity(basketPack.weight, stock.weight) : 0,
      time: new Date()
    }
  } else {
    newStock = {
      storeId: 's',
      packId: basketPack.packId,
      price: basketPack.price, 
      cost: basketPack.cost, 
      quantity: basketPack.quantity, 
      offerEnd: null,
      isActive: true,
      isAuto: false,
      weight: basketPack.weight || 0,
      time: new Date()
    }
  }
  otherPrices.push(newStock)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  packRef = firebase.firestore().collection('packs').doc(pack.id)
  batch.update(packRef, {
    prices
  })
  if (pack.forSale && newStock.price <= pack.price) {
    const { minPrice, minStoreId, weightedPrice, offerEnd } = getMinPrice(newStock, pack, packPrices, false)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      offerEnd,
      minStoreId
    })
  }
}

export const confirmReturnBasket = (returnBasket: ReturnBasket, storeId: string, orders: Order[], stockOperations: StockOperation[], packPrices: PackPrice[], packs: Pack[], purchases: Purchase[], stores: Store[]) => {
  const batch = firebase.firestore().batch()
  if (returnBasket.type === 'c') {
    const purchase = purchases.find(p => p.id === returnBasket.purchaseId)!
    let basket = purchase.basket.map(p => {
      const returnedQuantity = returnBasket.packs.find(bp => bp.packId === p.packId && (!bp.weight || bp.weight === p.weight))?.quantity || 0
      return {
        ...p,
        returnedQuantity
      }
    })
    const purchaseRef = firebase.firestore().collection('purchases').doc(purchase.id)
    basket = basket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.quantity, -1 * p.returnedQuantity)
      }
    })
    basket = basket.filter(p => p.quantity > 0)
    let total
    if (basket.length === 0) {
      batch.delete(purchaseRef)
      total = 0
    } else {
      total = basket.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
      batch.update(purchaseRef, {
        basket,
        total
      })
    }
    updateStoreBalance(batch, storeId, total - purchase.total, purchase.time, stores)
    returnBasket.packs.forEach(p => {
      returnPurchasePack(batch, purchase, p, orders, stockOperations, packPrices, packs)
    })  
  } else {
    addStockOperation(batch, returnBasket, packPrices, packs, stores, storeId)
  }
  batch.commit()
}

export const returnPurchasePack = (batch: firebase.firestore.WriteBatch, purchase: Purchase, pack: StockPack, orders: Order[], stockOperations: StockOperation[], packPrices: PackPrice[], packs: Pack[]) => {
  const purchaseQuantity = purchase.basket.find(p => p.packId === pack.packId && (!p.weight || p.weight === pack.weight))!.quantity
  if (purchaseQuantity === pack.quantity) {
    const affectedOrders = orders.filter(o => o.basket.find(p => p.lastPurchaseId === purchase.id))
    affectedOrders.forEach(o => {
      const orderBasket = o.basket
      const orderPackIndex = orderBasket.findIndex(p => p.lastPurchaseId === purchase.id && p.packId === pack.packId)
      const affectedPack = orderBasket[orderPackIndex]
      let avgCost, avgActual, status, newPurchased, newWeight
      if (affectedPack.purchased === affectedPack.lastPurchased) {
        newPurchased = 0
        avgCost = 0
        avgActual = 0
        status = 'n'
      } else if (affectedPack.weight > 0) {
        newWeight = addQuantity(affectedPack.weight, -1 * pack.weight)
        avgCost = Math.round((affectedPack.cost * affectedPack.weight + pack.cost * pack.weight) / newWeight)
        avgActual = Math.round((affectedPack.actual * affectedPack.weight + pack.actual * pack.weight) / newWeight)
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        status = 'p'
      } else {
        newPurchased = addQuantity(affectedPack.purchased, -1 * affectedPack.lastPurchased)
        avgCost = Math.round((affectedPack.cost * affectedPack.purchased - pack.cost * affectedPack.lastPurchased) / newPurchased)
        avgActual = Math.round((affectedPack.actual * affectedPack.purchased - pack.actual * affectedPack.lastPurchased) / newPurchased)
        status = 'p'
      }
      const newPack = {
        ...affectedPack,
        purchased: newPurchased,
        storeId: affectedPack.prevStoreId,
        cost: avgCost,
        actual: avgActual,
        gross: Math.round(avgActual * (newWeight || newPurchased)) + Math.round(affectedPack.price * addQuantity(affectedPack.quantity, -1 * newPurchased)),
        status,
        weight: newWeight || 0
      }
      orderBasket.splice(orderPackIndex, 1, newPack)
      const profit = orderBasket.reduce((sum, p) => sum + (['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0), 0)
      const total = orderBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
      const fixedFees = Math.round(setup.fixedFees * total)  
      const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
      const orderRef = firebase.firestore().collection('orders').doc(o.id)
      batch.update(orderRef, {
        basket: orderBasket,
        profit,
        total,
        fixedFees,
        fraction,
        status: orderBasket.find(bp => bp.status === 'p') ? 'e' : 'a',
        lastUpdate: new Date()
      })
    })  
  }
  const affectedStockOperation = stockOperations.find(t => t.purchaseId === purchase.id)
  let operationBasket, operationPackIndex, operationTotal
  if (affectedStockOperation) {
    operationBasket = affectedStockOperation.basket
    operationPackIndex = operationBasket.findIndex(p => p.packId === pack.packId)
    const outPack = {
      ...operationBasket[operationPackIndex],
      quantity: Math.min(pack.quantity, operationBasket[operationPackIndex].quantity)
    }
    packStockOut(batch, outPack, packPrices, packs)
    const storePackRef = firebase.firestore().collection('stock-operations').doc(affectedStockOperation.id)
    if (pack.quantity >= operationBasket[operationPackIndex].quantity) {
      if (operationBasket.length === 1) {
        batch.delete(storePackRef)
      } else {
        operationBasket.splice(operationPackIndex, 1)
        operationTotal = operationBasket.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
        batch.update(storePackRef, {
          basket: operationBasket,
          total: operationTotal
        })
      }  
    } else {
      operationBasket.splice(operationPackIndex, 1, {
        ...operationBasket[operationPackIndex],
        quantity: addQuantity(operationBasket[operationPackIndex].quantity, -1 * pack.quantity)
      })
      operationTotal = operationBasket.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
      batch.update(storePackRef, {
        basket: operationBasket,
        total: operationTotal
      })
    }
  }
}

const addStockOperation = (batch: firebase.firestore.WriteBatch, returnBasket: ReturnBasket, packPrices: PackPrice[], packs: Pack[], stores: Store[], storeId: string) => {
  const operationRef = firebase.firestore().collection('stock-operations').doc()
  let total = returnBasket.packs.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
  const newOperation = {
    basket: returnBasket.packs,
    storeId: storeId || '',
    type: returnBasket.type,
    total,
    isArchived: false,
    time: new Date()
  }
  batch.set(operationRef, newOperation)
  returnBasket.packs.forEach(p => {
    packStockOut(batch, p, packPrices, packs)
  })
  if (returnBasket.type === 's') {
    updateStoreBalance(batch, storeId, -1 * total, new Date(), stores)
  }
}

export const unfoldStockPack = (stockPack: PackPrice, packPrices: PackPrice[], packs: Pack[], stores: Store[]) => {
  const batch = firebase.firestore().batch()
  let pack = packs.find(p => p.id === stockPack.packId)!
  const basket = [{
    packId: pack.subPackId,
    quantity: pack.subQuantity,
    cost: Math.round(stockPack.cost / pack.subQuantity),
    actual: Math.round(stockPack.price / pack.subQuantity),
    price: Math.round(stockPack.price / pack.subQuantity),
    weight: 0
  }]
  stockIn(batch, 'c', basket, packPrices, packs)
  const returnBasket = {
    type: 'u',
    storeId: 's',
    purchaseId: '',
    packs: [{
      packId: pack.id!,
      quantity: 1,
      cost: stockPack.cost,
      price: stockPack.price,
      actual: stockPack.price,
      weight: 0
    }]
  }
  addStockOperation (batch, returnBasket, packPrices, packs, stores, 's')
  batch.commit()
}

export const quantityDetails = (basketPack: OrderBasketPack) => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased, basketPack.weight)}`
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
}

export const returnOrder = (order: Order, orderBasket: OrderBasketPack[], regionFees: number, packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const returnBasket = orderBasket.filter(p => p.quantity < p.oldQuantity)
  let basket = order.basket.slice()
  returnBasket.forEach(p => {
    let status, gross
    const orderPackIndex = basket.findIndex(bp => bp.packId === p.packId)
    if (p.quantity === 0) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = Math.round(p.actual * addQuantity(p.purchased, -1 * p.oldQuantity, p.quantity))
    }
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status,
      gross,
      returned: addQuantity(p.oldQuantity, -1 * p.quantity),
      quantity: basket[orderPackIndex].quantity // keep original quantity
    })
  })
  const profit = basket.reduce((sum, p) => sum + (['p', 'f', 'pu', 'pr'].includes(p.status) ? Math.round((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0), 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  const deliveryFees = order.deliveryFees + (order.status === 'd' ? regionFees : 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees,
    fraction,
    deliveryFees
  })
  if (total === 0) {
    updateOrderStatus(order, 'i', packPrices, packs, false, batch)
  } else if (order.status === 'd') {
    basket = basket.map(p => {
      return {
        ...p,
        quantity: p.returned
      }
    })
    basket = basket.filter(p => p.returned > 0)
    stockIn(batch, 'i', basket, packPrices, packs)  
  }
  const customerRef = firebase.firestore().collection('customers').doc(order.userId)
  if (order.status === 'd') {
    if (total === 0) {
      batch.update(customerRef, {
        deliveredOrdersCount: firebase.firestore.FieldValue.increment(-1),
        deliveredOrdersTotal: firebase.firestore.FieldValue.increment(-1 * order.total),
        returnedCount: firebase.firestore.FieldValue.increment(1)
      })  
    } else {
      batch.update(customerRef, {
        deliveredOrdersTotal: firebase.firestore.FieldValue.increment(total - order.total),
        returnedCount: firebase.firestore.FieldValue.increment(1)
      })
    }
  } else {
    batch.update(customerRef, {
      returnedCount: firebase.firestore.FieldValue.increment(1)
    })  
  }
  batch.commit()
}

export const updateOrderStatus = (order: Order, type: string, packPrices: PackPrice[], packs: Pack[], blockUserFlag: boolean, batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    status: type,
    lastUpdate: new Date(),
  })
  let customerRef, basket
  if (type === 'a') {
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      ordersCount: firebase.firestore.FieldValue.increment(1)
    }) 
    sendNotification(order.userId, labels.approval, labels.approveOrder, newBatch)
  } else if (type === 'i') {
    basket = order.basket.filter(p => p.purchased > 0)
    basket = basket.map(p => {
      return {
        ...p,
        quantity: p.purchased
      }
    })
    stockIn(newBatch, 'i', basket, packPrices, packs)
    if (blockUserFlag) {
      customerRef = firebase.firestore().collection('customers').doc(order.userId)
      newBatch.update(customerRef, {
        isBlocked: true
      })
      sendNotification(order.userId, labels.notice, labels.customerHasBeenBlocked, newBatch)
    }
  } else if (type === 'd'){
    basket = order.basket.filter(p => p.returned > 0)
    if (basket.length > 0) {
      basket = basket.map(p => {
        return {
          ...p,
          quantity: p.returned
        }
      })
      stockIn(newBatch, 'i', basket, packPrices, packs)  
    }
    order.basket.forEach(p => {
      const packInfo = packs.find(pa => pa.id === p.packId)!
      const productRef = firebase.firestore().collection('products').doc(packInfo.productId)
      newBatch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(p.purchased)
      })
      const affectedPacks = packs.filter(pa => pa.productId === packInfo.productId)
      affectedPacks.forEach(pa => {
        const packRef = firebase.firestore().collection('packs').doc(pa.id)
        newBatch.update(packRef, {
          sales: firebase.firestore.FieldValue.increment(p.purchased)
        })
      })
    })
    customerRef = firebase.firestore().collection('customers').doc(order.userId)
    newBatch.update(customerRef, {
      deliveredOrdersCount: firebase.firestore.FieldValue.increment(1),
      deliveredOrdersTotal: firebase.firestore.FieldValue.increment(order.total)
    })  
  }
  if (!batch) {
    newBatch.commit()
  }
}

export const editOrder = (order: Order, basket: OrderBasketPack[], packPrices: PackPrice[], packs: Pack[], batch?: firebase.firestore.WriteBatch) => {
  const newBatch = batch || firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchased)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.purchased, p.quantity)
      }
    })
    stockIn(newBatch, 'i', returnBasket, packPrices, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    const status = p.quantity === p.purchased ? 'f' : p.purchased > 0 ? 'p' : 'n'
    return {
      ...p,
      purchased: Math.min(p.quantity, p.purchased),
      status,
      gross: status === 'f' ? Math.round(p.actual * (p.weight || p.purchased)) : Math.round((p.actual || 0) * (p.weight || p.purchased)) + Math.round(p.price * addQuantity(p.quantity, -1 * p.purchased)),
    }
  })
  const profit = packBasket.reduce((sum, p) => sum + (['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0), 0)
  const total = packBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  let orderStatus = order.status
  if (packBasket.length === 0){
    if (returnBasket.length === 0){
      orderStatus = 'c'
    } else {
      orderStatus = 'i'
    }
  } else if (packBasket.length === packBasket.filter(p => p.status === 'f').length){
    orderStatus = 'f'
  } else if (packBasket.filter(p => p.purchased > 0).length > 0) {
    orderStatus = 'e'
  }
  const lastUpdate = orderStatus === order.status ? (order.lastUpdate || order.time) : new Date()
  const { id, ...others } = order
  const orderRef = firebase.firestore().collection('orders').doc(id)
  newBatch.update(orderRef, {
    ...others,
    basket: packBasket,
    total,
    profit,
    fixedFees,
    fraction,
    status: orderStatus,
    lastUpdate,
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const approveAlarm = (alarm: Alarm, alarms: Alarm[], newPackId: string, customer: CustomerInfo, packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const otherAlarms = alarms.filter(a => a.id !== alarm.id && a.userId === alarm.userId)
  otherAlarms.push({
    ...alarm,
    status: 'a',
    storeId: customer.storeId,
    newPackId
  })
  const newAlarms = otherAlarms.map(a => {
    const {userId, ...others} = a
    return others
  })
  const userRef = firebase.firestore().collection('users').doc(alarm.userId)
  batch.update(userRef, {
    alarms: newAlarms
  })
  const storePack = packPrices.find(p => p.storeId === customer.storeId && p.packId === (newPackId || alarm.packId))!
  let offerEnd = null
  if (alarm.offerDays) {
    offerEnd = alarm.time
    offerEnd.setDate(offerEnd.getDate() + alarm.offerDays)
  }
  const newStorePack = { 
    packId: newPackId || alarm.packId, 
    storeId: customer.storeId,
    cost: alarm.price,
    price: alarm.price,
    offerEnd,
    isActive: true,
    quantity: 0,
    weight: 0,
    isAuto: false,
    time: new Date()
  }
  if (alarm.type === 'cp') {
    const oldPrice = storePack.price || 0
    editPrice(newStorePack, oldPrice, packPrices, packs, batch)
    sendNotification(alarm.userId, labels.approval, labels.approveOwnerChangePrice, batch)
  } else if (alarm.type === 'ua') {
    deleteStorePack(storePack, packPrices, packs, batch)
    sendNotification(alarm.userId, labels.approval, labels.approveOwnerDelete, batch)
  } else {
    addPackPrice(newStorePack, packPrices, packs, batch)
    sendNotification(alarm.userId, labels.approval, labels.approveOwnerAddPack, batch)
  }
  batch.commit()
}

export const addStorePayment = (payment: StorePayment, stores: Store[]) => {
  const batch = firebase.firestore().batch()
  const storeRef = firebase.firestore().collection('stores').doc(payment.storeId)
  batch.update(storeRef, {
    payments: firebase.firestore.FieldValue.arrayUnion(payment)
  })
  updateStoreBalance(batch, payment.storeId, ['f', 'r'].includes(payment.type) ? payment.amount : -1 * payment.amount, payment.paymentDate, stores)
  batch.commit()
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

export const addMonthlyOperation = (operation: MonthlyOperation, orders: Order[], purchases: Purchase[], stockOperations: StockOperation[]) => {
  const batch = firebase.firestore().batch()
  const operationRef = firebase.firestore().collection('monthly-operations').doc(operation.id.toString())
  batch.set(operationRef, operation)
  const month = (Number(operation.id) % 100) - 1
  const year = Math.trunc(Number(operation.id) / 100)
  const ordersToArchived = orders.filter(o => ['s', 'r', 'd', 'c', 'm', 'u', 'i'].includes(o.status) && (o.time).getFullYear() === year && (o.time).getMonth() === month)
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
  const stockOperationsToArchived = stockOperations.filter(t => (t.time).getFullYear() === year && (t.time).getMonth() === month)
  stockOperationsToArchived.forEach(t => {
    const stockOperationRef = firebase.firestore().collection('stock-operations').doc(t.id)
    batch.update(stockOperationRef, {
      isArchived: true,
      archivedMonth: operation.id
    })
  })
  batch.commit()
}

export const getRequestedPacks = (orders: Order[], basket: Basket, packs: Pack[]) => {
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  let packsArray: RequestedPack[] = []
  approvedOrders.forEach(o => {
    o.basket.forEach(p => {
      if (['n', 'p'].includes(p.status)) {
        const packInfo = packs.find(pa => pa.id === p.packId)!
        const found = packsArray.findIndex(pa => pa.packId === p.packId && pa.price === p.price)
        if (!packInfo.byWeight && found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found], 
            quantity: addQuantity(packsArray[found].quantity, p.quantity, -1 * p.purchased),
          })
        } else {
          packsArray.push({
            packId: p.packId,
            price: p.price, 
            quantity: addQuantity(p.quantity, -1 * p.purchased),
            orderId: o.id!,
            offerId: p.offerId,
            weight: 0,
            packInfo
          })
        }
      }
    })
  })
  packsArray = packsArray.map(p => {
    let inBasket, inBasketQuantity
    if (p.packInfo.byWeight) {
      inBasket = basket.packs?.find(pa => pa.refPackId === p.packId && pa.orderId === p.orderId)
      inBasketQuantity = inBasket?.quantity
    } else {
      inBasket = basket.packs?.find(pa => pa.refPackId === p.packId && pa.price === p.price)
      inBasketQuantity = (inBasket?.quantity || 0) * (inBasket?.refPackQuantity || 0)
    }	
    return !inBasketQuantity ? p : (p.packInfo.isDivided ? {...p, quantity: 0} : {...p, quantity: addQuantity(p.quantity, -1 * inBasketQuantity)})
  })
  packsArray = packsArray.filter(p => p.quantity > 0)
  return packsArray.sort((p1, p2) => p1.packId > p2.packId ? 1 : -1)
}

export const allocateOrderPack = (order: Order, pack: Pack) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.slice()
  const orderPackIndex = basket.findIndex(p => p.packId === pack.id)
  basket.splice(orderPackIndex, 1, {
    ...basket[orderPackIndex],
    isAllocated: true
  })
  const isFinished = basket.filter(p => p.purchased > 0).length === basket.filter(p => p.purchased > 0 && p.isAllocated).length
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    status: isFinished ? 'p' : order.status,
    lastUpdate: isFinished ? new Date() : order.lastUpdate
  })
  sendNotification(order.userId, labels.notice, labels.prepareOrder, batch)
  batch.commit()
}

export const packUnavailable = (pack: Pack, price: number, orders: Order[], overPriced: boolean) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === price && ['n', 'p'].includes(p.status)))
  packOrders.forEach(o => {
    const basket = o.basket.slice()
    const orderPackIndex = basket.findIndex(p => p.packId === pack.id)
    let orderStatus = 'e'
    basket.splice(orderPackIndex, 1, {
      ...basket[orderPackIndex],
      status: basket[orderPackIndex].purchased > 0 ? 'pu' : 'u',
      gross: Math.round((basket[orderPackIndex].actual || 0) * (basket[orderPackIndex].weight || basket[orderPackIndex].purchased)),
      overPriced
    })
    if (basket.length === basket.filter(p => p.status === 'u').length) {
      orderStatus = 'u'
    } else if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
    let fixedFees, fraction, profit
    if (total === 0) {
      fixedFees = 0
      fraction = 0
      profit = 0
    } else {
      profit = basket.reduce((sum, p) => sum + (['p', 'f', 'pu'].includes(p.status) ? Math.round((p.actual - p.cost) * (p.weight || p.purchased)) : 0), 0)
      fixedFees = Math.round(setup.fixedFees * total)
      fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
    }
    const lastUpdate = orderStatus === o.status ? (o.lastUpdate || o.time) : new Date()
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fraction,
      status: orderStatus,
      lastUpdate
    })
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
        productId: doc.data().productId,
        productName: doc.data().productName,
        productAlias: doc.data().productAlias,
        productDescription: doc.data().productDescription,
        categoryId: doc.data().categoryId,
        trademark: doc.data().trademark,
        countryId: doc.data().countryId,
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
    })
  })
  return packs
}

export const mergeOrder = (order: Order, basket: OrderBasketPack[], mergedOrderId: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const newBasket = order.basket.slice()
  basket.forEach(p => {
    let newItem
    let found = newBasket.findIndex(bp => bp.packId === p.packId)
    if (found === -1) {
      newItem = p
    } else {
      const status = p.status === 'f' ? 'p' : p.status
      const newQuantity = addQuantity(newBasket[found].quantity, p.quantity)
      newItem = {
        ...newBasket[found],
        quantity: newQuantity,
        status,
        gross: status === 'f' ? Math.round(p.actual * (p.weight || p.purchased)) : Math.round((p.actual || 0) * (p.weight || p.purchased)) + Math.round(p.price * addQuantity(newQuantity, -1 * p.purchased)),
      }  
    }
    newBasket.splice(found === -1 ? newBasket.length : found, 1, newItem)
  })
  const total = newBasket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  let orderRef = firebase.firestore().collection('orders').doc(order.id)
  newBatch.update(orderRef, {
    basket: newBasket,
    total,
    fixedFees,
    fraction
  })
  orderRef = firebase.firestore().collection('orders').doc(mergedOrderId)
  newBatch.update(orderRef, {
    status: 'm',
    lastUpdate: new Date()
  })
  if (!batch) {
    newBatch.commit()
  }
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
    const {userId, ...others} = r
    return others
  })
  const userRef = firebase.firestore().collection('users').doc(rating.userId)
  batch.update(userRef, {
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
  const affectedPacks = packs.filter(p => p.productId === rating.productId)
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
        requestType: doc.data().requestType,
        total: doc.data().total,
        deliveryTime: doc.data().deliveryTime,
        deliveryFees: doc.data().deliveryFees,
        fraction: doc.data().fraction,
        profit: doc.data().profit,
        lastUpdate: doc.data().lastUpdate?.toDate() || null,
        requestTime: doc.data().requestTime?.toDate() || null,
        basket: doc.data().basket,
        requestBasket: doc.data().requestBasket,
        time: doc.data().time.toDate()
      })
    })
  })
  return orders
}

export const approveOrderRequest = (order: Order, orders: Order[], packPrices: PackPrice[], packs: Pack[]) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.requestType === 'm') {
    const mergedOrder = orders.find(o => o.userId === order.userId && o.status === 's')
    mergeOrder(order, order.requestBasket, mergedOrder?.id || '', batch)
    sendNotification(order.userId, labels.approval, labels.approveMergeRequest, batch)
  } else if (order.requestType === 'c') {
    updateOrderStatus (order, order.status === 'a' ? 'c' : 'i', packPrices, packs, false, batch)
    sendNotification(order.userId, labels.approval, labels.approveCancelRequest, batch)
  } else {
    editOrder (order, order.requestBasket, packPrices, packs, batch)
    sendNotification(order.userId, labels.approval, labels.approveEditRequest, batch)
  }
  batch.update(orderRef, {
    requestType: firebase.firestore.FieldValue.delete(),
    requestBasket: firebase.firestore.FieldValue.delete(),
    requestTime: firebase.firestore.FieldValue.delete()
  })
  batch.commit()
}

export const getArchivedStockOperations = (month: number) => {
  const stockOperations: StockOperation[] = []
  firebase.firestore().collection('stock-operations')
          .where('isArchived', '==', true)
          .where('archivedMonth', '==', month)
          .get().then(docs => {
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
  })
  return stockOperations
}

