import firebase from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { iAdvert, iCategory, iCustomerInfo, iError, iFriend, iLocation, iLog, iNotification, iOrder, iPack, iPackPrice, iProduct, iSpending, iStore, iUserInfo } from "./interfaces"
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