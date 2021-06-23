import firebase from './firebase'
import labels from './labels'
import { f7 } from 'framework7-react'
import { iAdvert, iCategory, iCustomerInfo, iError, iFriend, iLocation, iLog, iOrder, iPack, iProduct, iStore, iUserInfo } from "./interfaces"
import { randomColors, setup } from './config'

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

export const permitUser = async (userId: string, storeId: string | null, users: iUserInfo[], stores: iStore[]) => {
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

export const approveUser = (id: string, name: string, mobile: string, locationId: string, storeName: string | null, address: string, users: iUserInfo[], invitations: iFriend[]) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(id)
  batch.set(customerRef, {
    name: `${name}:${mobile}`,
    orderLimit: 0,
    isBlocked: false,
    storeName,
    storeId: null,
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
    storeName: null
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

export const editCustomer = (customer: iCustomerInfo, name: string, locationId: string, mobile: string, storeId: string | null, stores: iStore[]) => {
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
