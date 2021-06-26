import firebase from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { iAdvert, iBasket, iBasketPack, iCategory, iCustomerInfo, iError, iFriend, iLocation, iLog, iNotification, iOrder, iPack, iPackPrice, iProduct, iPurchase, iReturnBasket, iSpending, iStockPack, iStockTrans, iStore, iUserInfo } from "./interfaces"
import { randomColors, setup } from './config'
import moment from 'moment'

export const getMessage = (path: string, error: iError) => {
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

export const showMessage = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const addQuantity = (q1: number, q2: number, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
}

export const quantityText = (quantity: number, weight?: number): string => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}


export const addCountry = (name: string) => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayUnion(name)
  }, {merge: true})
}

export const deleteCountry = (name: string) => {
  firebase.firestore().collection('lookups').doc('c').set({
    values: firebase.firestore.FieldValue.arrayRemove(name)
  }, {merge: true})
}

export const editCountry = (name: string, oldName: string, products: iProduct[], packs: iPack[]) => {
  const batch = firebase.firestore().batch()
  const countriesRef = firebase.firestore().collection('lookups').doc('c')
  batch.update(countriesRef, {
    values: firebase.firestore.FieldValue.arrayRemove(oldName)
  })
  batch.update(countriesRef, {
    values: firebase.firestore.FieldValue.arrayUnion(name)
  })
  const affectedProducts = products.filter(p => p.country === oldName)
  affectedProducts.forEach(p => {
    const productRef = firebase.firestore().collection('products').doc(p.id)
    batch.update(productRef, {
      country: name
    })
    const affectedPacks = packs.filter(pa => pa.productId === p.id)
    affectedPacks.forEach(pa => {
      const packRef = firebase.firestore().collection('packs').doc(pa.id)
      batch.update(packRef, {
        country: name
      })
    })
  })
  batch.commit()
}

export const addLocation = (location: iLocation) => {
  firebase.firestore().collection('lookups').doc('l').set({
    values: firebase.firestore.FieldValue.arrayUnion(location)
  }, {merge: true})
}

export const editLocation = (location: iLocation, locations: iLocation[]) => {
  const values = locations.slice()
  const locationIndex = values.findIndex(l => l.id === location.id)
  values.splice(locationIndex, 1, location)
  firebase.firestore().collection('lookups').doc('l').update({
    values
  })
}

export const deleteLog = (log: iLog) => {
  firebase.firestore().collection('logs').doc(log.id).delete()
}

export const addAdvert = async (advert: iAdvert, image?: File) => {
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

export const editAdvert = async (advert: iAdvert, image?: File) => {
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

export const deleteAdvert = async (advert: iAdvert) => {
  firebase.firestore().collection('adverts').doc(advert.id).delete()
  if (advert.imageUrl) {
    const ext = advert.imageUrl.slice(advert.imageUrl.lastIndexOf('.'), advert.imageUrl.indexOf('?'))
    await firebase.storage().ref().child('adverts/' + advert.id + ext).delete()
  }
}

export const updateAdvertStatus = (advert: iAdvert, adverts: iAdvert[]) => {
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

export const addCategory = (parentId: string, name: string, ordering: number) => {
  const batch = firebase.firestore().batch()
  let categoryRef
  if (parentId !== '0') {
    categoryRef = firebase.firestore().collection('categories').doc(parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
  }
  categoryRef = firebase.firestore().collection('categories').doc()
  batch.set(categoryRef, {
    parentId,
    name,
    ordering,
    isLeaf: true,
    isActive: false
  })
  batch.commit()
}

export const editCategory = (category: iCategory, oldCategory: iCategory, categories: iCategory[]) => {
  const batch = firebase.firestore().batch()
  const { id, ...others } = category
  let categoryRef = firebase.firestore().collection('categories').doc(id)
  batch.update(categoryRef, others)
  if (category.parentId !== oldCategory.parentId) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: false
    })
    const childrenCount = categories.filter(c => c.id !== id && c.parentId === oldCategory.parentId).length
    if (childrenCount === 0) {
      categoryRef = firebase.firestore().collection('categories').doc(oldCategory.parentId)
      batch.update(categoryRef, {
        isLeaf: true
      })  
    }
  }
  batch.commit()
}

export const deleteCategory = (category: iCategory, categories: iCategory[]) => {
  const batch = firebase.firestore().batch()
  let categoryRef = firebase.firestore().collection('categories').doc(category.id)
  batch.delete(categoryRef)
  const childrenCount = categories.filter(c => c.id !== category.id && c.parentId === category.parentId).length
  if (childrenCount === 0) {
    categoryRef = firebase.firestore().collection('categories').doc(category.parentId)
    batch.update(categoryRef, {
      isLeaf: true
    })
  }
  batch.commit()
}

export const getCategoryName = (category: iCategory, categories: iCategory[]): string => {
  if (category.parentId === '0') {
    return category.name
  } else {
    const categoryParent = categories.find(c => c.id === category.parentId)!
    return getCategoryName(categoryParent, categories) + '-' + category.name
  }
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

export const permitUser = async (userId: string, storeId: string, users: iUserInfo[], stores: iStore[]) => {
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

export const deleteUser = async (user: iUserInfo, orders: iOrder[]) => {
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

export const approveUser = (id: string, name: string, mobile: string, locationId: string, storeName: string, address: string, users: iUserInfo[], invitations: iFriend[]) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name: `${name}:${mobile}`,
    orderLimit: 0,
    isBlocked: false,
    storeName,
    storeId: '',
    address,
    deliveryFees: 0,
    specialDiscount: 0,
    discounts: 0,
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
    locationId,
    storeName: ''
  })
  const invitedBy = invitations.filter(i => i.mobile === mobile)
  invitedBy.forEach(i => {
    const otherInvitations = invitations.filter(ii => ii.userId === i.userId && ii.mobile !== i.mobile)
    otherInvitations.push({
      ...i,
      status: 'r'
    })
    const friends = otherInvitations.map(ii => {
      const {userId, ...others} = ii
      return others
    })
    const userRef = firebase.firestore().collection('users').doc(i.userId)
    batch.update(userRef, {
      friends
    })
    if (i.status === 's') {
      const customerRef = firebase.firestore().collection('customers').doc(i.userId)
      batch.update(customerRef, {
        discounts: firebase.firestore.FieldValue.increment(setup.invitationDiscount)
      })
    }
  })
  batch.commit()
}

export const editCustomer = (customer: iCustomerInfo, name: string, locationId: string, mobile: string, storeId: string, stores: iStore[]) => {
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
    locationId
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

export const editStore = (store: iStore) => {
  const { id, ...others } = store
  firebase.firestore().collection('stores').doc(id).update(others)
}

export const productOfText = (trademark: string, country: string) => {
  return trademark ? `${labels.productFrom} ${trademark}-${country}` : `${labels.productOf} ${country}`
}

export const addProduct = async (product: iProduct, image?: File) => {
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

export const editProduct = async (product: iProduct, oldName: string, packs: iPack[], image?: File) => {
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
      country: product.country,
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

export const deleteProduct = async (product: iProduct) => {
  if (product.imageUrl) {
    const ext = product.imageUrl.slice(product.imageUrl.lastIndexOf('.'), product.imageUrl.indexOf('?'))
    await firebase.storage().ref().child('products/' + product.id + ext).delete()
  }
  firebase.firestore().collection('products').doc(product.id).delete()
}

export const archiveProduct = (product: iProduct, packs: iPack[]) => {
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

export const getPackStores = (pack: iPack, packPrices: iPackPrice[], packs: iPack[], basketStockQuantity?: number) => {
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

export const changeStorePackStatus = (storePack: iPackPrice, packPrices: iPackPrice[], packs: iPack[], batch?: firebase.firestore.WriteBatch) => {
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

const getMinPrice = (storePack: iPackPrice, pack: iPack, packPrices: iPackPrice[], isDeletion: boolean) => {
  const packStores = packPrices.filter(p => p.packId === pack.id && p.storeId !== storePack.storeId && p.price > 0 && p.isActive)
  if (!isDeletion && storePack.isActive){
    packStores.push(storePack)
  }
  let minPrice = 0, weightedPrice = 0, offerEnd = null, minStoreId = ''
  if (packStores.length > 0){
    const prices = packStores.map(s => s.price)
    minPrice = Math.min(...prices)
    weightedPrice = Math.round(minPrice / pack.unitsCount)
    packStores.sort((p1, p2) => (p2.offerEnd ? moment(p2.offerEnd) : moment().add(1000, 'days')) > (p1.offerEnd ? moment(p1.offerEnd) : moment().add(1000, 'days')) ? 1 : -1)
    offerEnd = packStores.find(s => s.price === minPrice)!.offerEnd
    if (packStores.filter(s => s.price === minPrice).length === 1) {
      minStoreId = packStores.find(s => s.price === minPrice)!.storeId
    }
  }
  return {minPrice, minStoreId, weightedPrice, offerEnd}
}

export const deleteStorePack = (storePack: iPackPrice, packPrices: iPackPrice[], packs: iPack[], batch?: firebase.firestore.WriteBatch) => {
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

export const refreshPackPrice = (pack: iPack, packPrices: iPackPrice[]) => {
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

export const addPack = async (pack: iPack, image?: File, subPackInfo?: iPack) => {
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

export const editPack = async (newPack: iPack, oldPack: iPack, packs: iPack[], image?: File) => {
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

export const addPackPrice = (storePack: iPackPrice, packPrices: iPackPrice[], packs: iPack[], batch?: firebase.firestore.WriteBatch) => {
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

export const editPrice = (storePack: iPackPrice, oldPrice: number, packPrices: iPackPrice[], packs: iPack[], batch?: firebase.firestore.WriteBatch) => {
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

export const sendNotification = (userId: string, title: string, message: string, batch?: firebase.firestore.WriteBatch) => {
  const newBatch =  batch || firebase.firestore().batch()
  const userRef = firebase.firestore().collection('users').doc(userId)
  newBatch.update(userRef, {
    notifications: firebase.firestore.FieldValue.arrayUnion({
      id: Math.random().toString(),
      title,
      message,
      status: 'n',
      time: new Date()
    })
  })
  if (!batch) {
    newBatch.commit()
  }
}

export const deleteNotification = (notification: iNotification, notifications: iNotification[]) => {
  const otherNotifications = notifications.filter(n => n.userId === notification.userId && n.id !== notification.id)
  const result = otherNotifications.map(n => {
    const {userId, ...others} = n
    return others
  })
  firebase.firestore().collection('users').doc(notification.userId).update({
    notifications: result
  })
}

export const addSpending = (spending: iSpending) => {
  firebase.firestore().collection('spendings').add(spending)
}

export const editSpending = (spending: iSpending) => {
  const { id, ...others } = spending
  firebase.firestore().collection('spendings').doc(id).update(others)
}

export const approveInvitation = (invitation: iFriend, invitations: iFriend[]) => {
  const batch = firebase.firestore().batch()
  const otherInvitations = invitations.filter(i => i.userId === invitation.userId && i.mobile !== invitation.mobile)
  otherInvitations.push(invitation)
  const friends = otherInvitations.map(i => {
    const {userId, ...others} = i
    return others
  })
  const userRef = firebase.firestore().collection('users').doc(invitation.userId)
  batch.update(userRef, {
    friends
  })
  if (invitation.status === 's') {
    sendNotification(invitation.userId, labels.approval, labels.approveInvitation, batch)
  }
  batch.commit()
}

export const stockOut = (basket: iBasketPack[], orders: iOrder[], packPrices: iPackPrice[], packs: iPack[]) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stock-trans').doc()
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
  batch.set(transRef, {
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

export const updateOrder = (batch: firebase.firestore.WriteBatch, storeId: string, order: iOrder, basketPack: iBasketPack, purchaseId?: string) => {
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
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fixedFees,
    fraction,
    status: orderStatus,
    lastUpdate: new Date()
  })
}

export const updateOrders = (batch: firebase.firestore.WriteBatch, storeId: string, orders: iOrder[], basketPack: iBasketPack, purchaseId?: string) => {
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

const packStockOut = (batch: firebase.firestore.WriteBatch, basketPack: iStockPack, packPrices: iPackPrice[], packs: iPack[]) => {
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

export const confirmPurchase = (basket: iBasketPack[], orders: iOrder[], storeId: string, packPrices: iPackPrice[], packs: iPack[], stores: iStore[], total: number) => {
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
  let packsIn: iBasketPack[] = []
  const approvedOrders = orders.filter(o => ['a', 'e'].includes(o.status))
  basket.forEach(p => {
    let packOrders, remaining, packInfo: iPack, quantity, mainRemaining, subPack: iBasketPack, pack = p
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
          refPackQuantity: 0
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
            refPackQuantity: 0
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
              refPackQuantity: 0
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

export const updateStoreBalance = (batch: firebase.firestore.WriteBatch, storeId: string, amount: number, balanceDate: Date, stores: iStore[]) => {
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

const stockIn = (batch: firebase.firestore.WriteBatch, type: string, basket: iStockPack[], packPrices: iPackPrice[], packs: iPack[], storeId?: string, purchaseId?: string) => {
  const transRef = firebase.firestore().collection('stock-trans').doc()
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
  batch.set(transRef, {
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

const packStockIn = (batch: firebase.firestore.WriteBatch, basketPack: iStockPack, packPrices: iPackPrice[], packs: iPack[]) => {
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

export const confirmReturnBasket = (returnBasket: iReturnBasket, storeId: string, orders: iOrder[], stockTrans: iStockTrans[], packPrices: iPackPrice[], packs: iPack[], purchases: iPurchase[], stores: iStore[]) => {
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
      returnPurchasePack(batch, purchase, p, orders, stockTrans, packPrices, packs)
    })  
  } else {
    addStockTrans(batch, returnBasket, packPrices, packs, stores, storeId)
  }
  batch.commit()
}

export const returnPurchasePack = (batch: firebase.firestore.WriteBatch, purchase: iPurchase, pack: iStockPack, orders: iOrder[], stockTrans: iStockTrans[], packPrices: iPackPrice[], packs: iPack[]) => {
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
  const affectedStockTrans = stockTrans.find(t => t.purchaseId === purchase.id)
  let transBasket, transPackIndex, transTotal
  if (affectedStockTrans) {
    transBasket = affectedStockTrans.basket
    transPackIndex = transBasket.findIndex(p => p.packId === pack.packId)
    const outPack = {
      ...transBasket[transPackIndex],
      quantity: Math.min(pack.quantity, transBasket[transPackIndex].quantity)
    }
    packStockOut(batch, outPack, packPrices, packs)
    const storePackRef = firebase.firestore().collection('stock-trans').doc(affectedStockTrans.id)
    if (pack.quantity >= transBasket[transPackIndex].quantity) {
      if (transBasket.length === 1) {
        batch.delete(storePackRef)
      } else {
        transBasket.splice(transPackIndex, 1)
        transTotal = transBasket.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
        batch.update(storePackRef, {
          basket: transBasket,
          total: transTotal
        })
      }  
    } else {
      transBasket.splice(transPackIndex, 1, {
        ...transBasket[transPackIndex],
        quantity: addQuantity(transBasket[transPackIndex].quantity, -1 * pack.quantity)
      })
      transTotal = transBasket.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
      batch.update(storePackRef, {
        basket: transBasket,
        total: transTotal
      })
    }
  }
}

const addStockTrans = (batch: firebase.firestore.WriteBatch, returnBasket: iReturnBasket, packPrices: iPackPrice[], packs: iPack[], stores: iStore[], storeId: string) => {
  const transRef = firebase.firestore().collection('stock-trans').doc()
  let total = returnBasket.packs.reduce((sum, p) => sum + Math.round(p.cost * p.quantity), 0)
  const newTrans = {
    basket: returnBasket.packs,
    storeId: storeId || '',
    type: returnBasket.type,
    total,
    isArchived: false,
    time: new Date()
  }
  batch.set(transRef, newTrans)
  returnBasket.packs.forEach(p => {
    packStockOut(batch, p, packPrices, packs)
  })
  if (returnBasket.type === 's') {
    updateStoreBalance(batch, storeId, -1 * total, new Date(), stores)
  }
}

export const unfoldStockPack = (stockPack: iPackPrice, packPrices: iPackPrice[], packs: iPack[], stores: iStore[]) => {
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
  addStockTrans (batch, returnBasket, packPrices, packs, stores, 's')
  batch.commit()
}