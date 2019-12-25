import firebase from './firebase'
import labels from './labels'

export const getMessage = (props, error) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser.uid,
      error: error.code,
      page: props.f7route.route.component.name,
      time: new Date()
    })
  }
  return labels[errorCode] ? labels[errorCode] : labels['unknownError']
}

export const showMessage = (props, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  });
  message.open();
}

export const showError = (props, messageText) => {
  const message = props.f7router.app.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  });
  message.open();
}

export const quantityText = quantity => {
  return `${quantity < 1 ? quantity * 1000 + ' ' + labels.gram : quantity}`
}

export const quantityDetails = basketPack => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased)}`
    if (basketPack.weight && basketPack.weight !== basketPack.purchased) {
      text += `, ${labels.weight}: ${quantityText(basketPack.weight)}`
    }
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
}

export const addQuantity = (q1, q2, q3 = 0) => {
  if (parseInt(q1) !== q1 || parseInt(q2) !== q2 || parseInt(q3) !== q3) {
    return parseInt((q1 * 1000) + (q2 * 1000) + (q3 * 1000)) / 1000
  } else {
    return q1 + q2 + q3
  }
}

export const login = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const logout = () => {
  return firebase.auth().signOut()
}

export const updateOrder = (batch, storeId, order, basketPack, customers) => {
  const orderPack = order.basket.find(p => p.packId === basketPack.packId)
  const otherPacks = order.basket.filter(p => p.packId !== basketPack.packId)
  let orderStatus = 'e'
  const orderPackQuantity = orderPack.weight || orderPack.purchased
  const basketPackQuantity = basketPack.weight || basketPack.quantity
  const avgCost = orderPackQuantity === 0 ? basketPack.cost : (parseInt(orderPack.cost * orderPackQuantity) + parseInt(basketPack.cost * basketPackQuantity)) / addQuantity(orderPackQuantity, basketPackQuantity)
  const avgActual = orderPackQuantity === 0 ? basketPack.actual : (parseInt(orderPack.actual * orderPackQuantity) + parseInt(basketPack.actual * basketPackQuantity)) / addQuantity(orderPackQuantity, basketPackQuantity)
  const weight = addQuantity(orderPack.weight ? orderPack.weight : 0, basketPack.weight)
  let status 
  if (basketPack.isDivided) {
    status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * basketPack.quantity)) / orderPack.quantity * 100) <= labels.margin ? 'f' : 'p'
  } else {
    status = orderPack.quantity === addQuantity(orderPack.purchased, basketPack.quantity) ? 'f' : 'p'
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      purchased: addQuantity(orderPack.purchased, basketPack.quantity),
      storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
      cost: avgCost,
      actual: avgActual,
      gross: status === 'f' ? avgActual * addQuantity(orderPackQuantity, basketPackQuantity) : avgActual * addQuantity(orderPackQuantity, basketPackQuantity) + orderPack.price * addQuantity(orderPack.quantity, -1 * orderPackQuantity, -1 * basketPackQuantity),
      weight,
      status
    }
  ]
  if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
    orderStatus = 'f'
  }
  const customer = customers.find(c => c.id === order.userId)
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? ((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const total = basket.reduce((sum, p) => sum + p.gross, 0)
  const fixedFees = Math.ceil(((order.urgent ? 1.5 : 1) * labels.fixedFees / 100 * total) / 50) * 50
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = customer.discounts > 0 ? Math.min(customer.discounts, fixedFees, labels.maxDiscount) : 0
      break
    default:
  }
  const fraction = total - Math.floor(total / 50) * 50
  discount.value = discount.value + fraction
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    profit,
    total,
    fixedFees,
    discount,
    status: orderStatus,
    statusTime: new Date()
  })
}

export const updateOrders = (batch, storeId, orders, basketPack, customers) => {
  let remaining = basketPack.quantity
  let orderPack, otherPacks, purchased, orderStatus, avgCost, avgActual
  let basket, customer, profit, total, fixedFees, discount, fraction, orderRef
  for (let o of orders){
    if (remaining <= 0) break
    orderPack = o.basket.find(p => p.packId === basketPack.packId)
    otherPacks = o.basket.filter(p => p.packId !== basketPack.packId)
    orderStatus = 'e'
    if (remaining >= addQuantity(orderPack.quantity, -1 * orderPack.purchased)) {
      purchased = addQuantity(orderPack.quantity, -1 * orderPack.purchased)
    } else {
      purchased = remaining
    }
    avgCost = orderPack.purchased === 0 ? basketPack.cost : (parseInt(orderPack.cost * orderPack.purchased) + parseInt(basketPack.cost * purchased)) / addQuantity(orderPack.purchased, purchased)
    avgActual = orderPack.purchased === 0 ? basketPack.actual : (parseInt(orderPack.actual * orderPack.purchased) + parseInt(basketPack.actual * purchased)) / addQuantity(orderPack.purchased, purchased)
    const status = orderPack.quantity === addQuantity(orderPack.purchased, purchased) ? 'f' : 'p'
    basket = [
      ...otherPacks, 
      {
        ...orderPack, 
        purchased: addQuantity(orderPack.purchased, purchased),
        storeId: orderPack.storeId && orderPack.storeId !== storeId ? 'm' : storeId,
        cost: avgCost,
        actual: avgActual,
        gross: status === 'f' ? avgActual * addQuantity(orderPack.purchased, purchased) : avgActual * addQuantity(orderPack.purchased, purchased) + orderPack.price * addQuantity(orderPack.quantity, -1 * orderPack.purchased, -1 * purchased),
        status
      }
    ]
    if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    customer = customers.find(c => c.id === o.userId)
    profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight ? p.weight : p.purchased)) : 0, 0)
    total = basket.reduce((sum, p) => sum + p.gross, 0)
    fixedFees = Math.ceil(((o.urgent ? 1.5 : 1) * labels.fixedFees / 100 * total) / 50) * 50
    discount = o.discount
    switch (discount.type) {
      case 'f':
        discount.value = fixedFees
        break;
      case 'p':
        discount.value = customer.discounts > 0 ? Math.min(customer.discounts, fixedFees, labels.maxDiscount) : 0
        break
      default:
    }
    fraction = total - Math.floor(total / 50) * 50
    discount.value = discount.value + fraction
    orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      discount,
      status: orderStatus,
      statusTime: new Date()
    })
    remaining -=  purchased
  }
  return remaining
}

export const returnOrder = (order, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  let basket = order.basket.filter(p => p.returned > 0)
  basket = basket.map(p => {
    return {
      ...p,
      quantity: p.returned
    }
  })
  stockIn(batch, 'i', basket, storePacks, packs)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (order.total === 0) {
    batch.update(orderRef, {
      status: 'i',
      position: firebase.firestore.FieldValue.delete(),
      statusTime: new Date()
    })
  } else {
    batch.update(orderRef, {
      position: firebase.firestore.FieldValue.delete(),
    })
  }
  const returnedPenalty = basket.length * labels.returnPenalty
  if (returnedPenalty > 0) {
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(-1 * returnedPenalty)
    })    
  }
  return batch.commit()
}

export const updateOrderStatus = (order, type, storePacks, packs, users, invitations, cancelOrderId) => {
  const batch = firebase.firestore().batch()
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  if (type === 'p'){
    batch.update(orderRef, {
      status: type,
      position: 's',
      statusTime: new Date()
    })
  } else {
    batch.update(orderRef, {
      status: type,
      statusTime: new Date()
    })
  }
  if (cancelOrderId) {
    const cancelOrderRef = firebase.firestore().collection('cancelOrders').doc(cancelOrderId)
    batch.update(cancelOrderRef, {
      status: 'a'
    })  
  }
  if (type === 'i') {
    const basket = order.basket.filter(p => p.purchased > 0)
    stockIn(batch, 'i', basket, storePacks, packs)
  }
  if (type === 'd'){
    order.basket.forEach(p => {
      const packInfo = packs.find(pa => pa.id === p.packId)
      const productRef = firebase.firestore().collection("products").doc(packInfo.productId)
      batch.update(productRef, {
        sales: firebase.firestore.FieldValue.increment(parseInt(p.quantity))
      })
    })
    const customerRef = firebase.firestore().collection('customers').doc(order.userId)
    if (order.discount.type === 'p'){
      batch.update(customerRef, {
        orderLimit: firebase.firestore.FieldValue.increment(25000),
        discounts: firebase.firestore.FieldValue.increment(-1 * order.discount.value)
      })  
    } else {
      batch.update(customerRef, {
        orderLimit: firebase.firestore.FieldValue.increment(25000)
      })  
    }
    const userInfo = users.find(u => u.id === order.userId)
    const invitedBy = invitations.find(i => i.friendMobile === userInfo.mobile)
    if (invitedBy) {
      const invitedByRef = firebase.firestore().collection('customers').doc(invitedBy.userId)
      batch.update(invitedByRef, {
        discounts: firebase.firestore.FieldValue.increment(labels.invitationDiscount)
      })
    }
  }
  return batch.commit()
}

const stockIn = (batch, type, basket, storePacks, packs, storeId) => {
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const newBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: parseInt(p.cost * (100 + labels.profit) / 100),
      quantity: p.quantity,
      cost: p.cost
    }
  })
  const total = newBasket.reduce((sum, p) => sum + p.cost * p.quantity, 0)
  batch.set(transRef, {
    basket: newBasket,
    storeId: storeId || '',
    type,
    total,
    time: new Date()
  })
  newBasket.forEach(p => {
    packStockIn(batch, p, storePacks, packs)
  })

}

const packStockIn = (batch, basketPack, storePacks, packs) => {
  let stock = storePacks.find(p => p.packId === basketPack.packId && p.storeId === 's')
  let storePackRef, newStock
  if (stock) {
    const avgPrice = parseInt(stock.quantity * stock.price + basketPack.quantity * basketPack.price) / addQuantity(basketPack.quantity, stock.quantity)
    const avgCost = parseInt(stock.quantity * stock.cost + basketPack.quantity * basketPack.cost) / addQuantity(basketPack.quantity, stock.quantity)
    newStock = {
      ...stock,
      price: parseInt(avgPrice), 
      cost: parseInt(avgCost), 
      quantity: addQuantity(basketPack.quantity, stock.quantity), 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('storePacks').doc(stock.id)
    batch.update(storePackRef, newStock)
  } else {
    newStock = {
      storeId: 's',
      packId: basketPack.packId,
      price: basketPack.price, 
      cost: basketPack.cost, 
      quantity: basketPack.quantity, 
      time: new Date()
    }
    storePackRef = firebase.firestore().collection('storePacks').doc()
    batch.set(storePackRef, newStock)
  }
  const pack = packs.find(p => p.id === basketPack.packId)
  if (!stock || stock.price === pack.price || newStock.price < pack.price) {
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(newStock, pack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
}

export const confirmPurchase = (basket, orders, storeId, storePacks, packs, total, discount, customers) => {
  const batch = firebase.firestore().batch()
  const purchaseRef = firebase.firestore().collection('purchases').doc()
  const packBasket = basket.map(p => {
    let newPack = {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost
    }
    if (p.weight) newPack['weight'] = p.weight
    return newPack
  })
  batch.set(purchaseRef, {
    storeId,
    basket: packBasket,
    total,
    discount: parseInt(discount * 1000),
    time: new Date()
  })
  let packOrders, remaining, packInfo, pack, quantity
  let packsIn = []
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  basket.forEach(p => {
    if (p.weight) {
      if (p.orderId) {
        const order = orders.find(o => o.id === p.orderId)
        updateOrder(batch, storeId, order, p, customers)
      } else {
        packsIn.push(p)
      }
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      remaining = updateOrders(batch, storeId, packOrders, p, customers)
      if (remaining > 0) {
        packInfo = packs.find(pa => pa.id === p.packId)
        if (packInfo.subPackId) {
          pack = {
            packId: packInfo.subPackId,
            quantity: remaining * packInfo.subQuantity,
            cost: parseInt(p.cost / packInfo.subQuantity * packInfo.subPercent / 100),
            actual: parseInt(p.actual / packInfo.subQuantity * packInfo.subPercent / 100),
          }
          packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.subPackId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
          packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
          quantity = updateOrders(batch, storeId, packOrders, pack, customers)
          if (quantity > 0) {
            packsIn.push({...pack, quantity})
          }
          if (packInfo.bonusPackId){
            pack = {
              packId: packInfo.bonusPackId,
              quantity: remaining * packInfo.bonusQuantity,
              cost: parseInt(p.cost / packInfo.bonusQuantity * packInfo.bonusPercent / 100),
              actual: parseInt(p.actual / packInfo.bonusQuantity * packInfo.bonusPercent / 100),
            }
            packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === packInfo.bonusPackId && op.price === p.price && (op.status === 'n' || op.status === 'p')))
            packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
            quantity = updateOrders(batch, storeId, packOrders, pack, customers)
            if (quantity > 0) {
              packsIn.push({...pack, quantity})
            }
          }
        } else {
          packsIn.push({...p, quantity: remaining})
        }
      }
    }
  })
  if (packsIn.length > 0) {
      stockIn(batch, 'p', packsIn, storePacks, packs, storeId)
    }
  return batch.commit()
}

export const stockOut = (basket, orders, storePacks, packs, customers) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = basket.map(p => {
    return {
      packId: p.packId,
      price: p.actual,
      quantity: p.quantity,
      cost: p.cost
    }
  })
  const total = packBasket.reduce((sum, p) => sum + parseInt(p.price * p.quantity), 0)
  batch.set(transRef, {
    basket: packBasket,
    type: 's',
    total,
    time: new Date()
  })
  const approvedOrders = orders.filter(o => o.status === 'a' || o.status === 'e')
  let packOrders
  basket.forEach(p => {
    if (p.orderId) {
      const order = orders.find(o => o.id === p.orderId)
      updateOrder(batch, 's', order, p, customers)
    } else {
      packOrders = approvedOrders.filter(o => o.basket.find(op => op.packId === p.packId && op.price === p.price))
      packOrders.sort((o1, o2) => o1.time.seconds - o2.time.seconds)
      updateOrders(batch, 's', packOrders, p, customers)
    }
    packStockOut(batch, p, storePacks, packs)
  })
  return batch.commit()
}

const packStockOut = (batch, basketPack, storePacks, packs) => {
  const stock = storePacks.find(s => s.packId === basketPack.packId && s.storeId === 's')
  const storePackRef = firebase.firestore().collection('storePacks').doc(stock.id)
  if (addQuantity(stock.quantity, -1 * basketPack.quantity) > 0) {
    batch.update(storePackRef, {
      quantity: addQuantity(stock.quantity, -1 * basketPack.quantity), 
    })
  } else {
    batch.update(storePackRef, {
      price: 0,
      cost: 0,
      quantity: 0, 
      time: new Date()
    })
    const pack = packs.find(p => p.id === basketPack.packId)
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(stock, pack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(basketPack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
}

export const addStorePack = (storePack, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc()
  batch.set(storePackRef, storePack)
  let newPack = pack
  if (storePack.cost !== storePack.price && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0) {
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const addProduct = async (product, image) => {
  const docRef = await firebase.firestore().collection('products').add({
    ...product,
    sales: 0,
    time: new Date()
  })
  const filename = image.name
  const ext = filename.slice(filename.lastIndexOf('.'))
  const fileData = await firebase.storage().ref().child('products/' + docRef.id + ext).put(image)
  const url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  return firebase.firestore().collection('products').doc(docRef.id).update({imageUrl: url})
}

export const editProduct = async (product, image) => {
  let url
  if (image) {
    const filename = image.name
    const ext = filename.slice(filename.lastIndexOf('.'))
    const fileData = await firebase.storage().ref().child('products/' + product.id + ext).put(image)
    url = await firebase.storage().ref().child(fileData.metadata.fullPath).getDownloadURL()
  } else {
    url = product.imageUrl
  }
  return firebase.firestore().collection('products').doc(product.id).update({
    ...product,
    imageUrl: url
  })
}

export const editPrice = (storePack, oldPrice, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.update(storePackRef, storePack)
  let newPack = pack
  if (storePack.cost !== storePack.price && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price < newPack.price || newPack.price === 0 || newPack.price === oldPrice) {
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(storePack, newPack, storePacks, packs, false)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const haltOffer = (storePack, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.update(storePackRef, {
    price: 0
  })
  if (storePack.price === pack.price) {
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(storePack, pack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const extendOffer = storePack => {
  return firebase.firestore().collection('storePacks').doc(storePack.id).update(storePack)
}

const getMinPrice = (storePack, pack, storePacks, packs, isDeletion) => {
  let packStores = storePacks.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0)
  packStores = packStores.filter(s => s.storeId !== storePack.storeId)
  if (!isDeletion){
    packStores.push(storePack)
  }
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? minPrice / pack.unitsCount : 0
  const hasOffer = packStores.find(s => s.price === minPrice && s.offerEnd) ? true : false
  return {minPrice, weightedPrice, hasOffer}
}

export const refreshPackPrice = (pack, storePacks, packs) => {
  let packStores = storePacks.filter(p => (p.packId === pack.id || (p.cost !== p.price && packs.find(pa => pa.id === p.packId && pa.subPackId === pack.id))) && p.price > 0)
  const stock = packStores.find(s => s.storeId === 's')
  if (stock && stock.quantity > 0) {
    packStores = packStores.filter(s => s.cost === s.price || s.storeId === 's') //omit type 5
  }
  const prices = packStores.map(s => s.price)
  let minPrice = Math.min(...prices)
  minPrice = minPrice === Infinity ? 0 : minPrice
  const weightedPrice = pack.unitsCount ? (minPrice / pack.unitsCount).toFixed(3) : 0
  const hasOffer = packStores.find(s => s.price === minPrice && s.offerEnd) ? true : false
  return firebase.firestore().collection('packs').doc(pack.id).update({
    price: minPrice,
    weightedPrice,
    hasOffer
  })
}

export const deleteStorePack = (storePack, pack, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
  batch.delete(storePackRef)
  let newPack = pack
  if (storePack.cost !== storePack.price && pack.subPackId) { //from type 5
    newPack = packs.find(p => p.id === pack.subPackId)
  } 
  if (storePack.price === newPack.price) {
    const { minPrice, weightedPrice, hasOffer } = getMinPrice(storePack, newPack, storePacks, packs, true)
    const packRef = firebase.firestore().collection('packs').doc(newPack.id)
    batch.update(packRef, {
      price: minPrice,
      weightedPrice,
      hasOffer
    })
  }
  return batch.commit()
}

export const confirmPrice = storePack => {
  return firebase.firestore().collection('storePacks').doc(storePack.id).update({
    time: new Date()
  })
}

export const addStore = store => {
  return firebase.firestore().collection('stores').add(store)
}

export const editStore = store => {
  return firebase.firestore().collection('stores').doc(store.id).update(store)
}

export const addStock = name => {
  return firebase.firestore().collection("stores").doc("s").set({
    name,
    type: '1'
  })
}

export const addSpending = spending => {
  return firebase.firestore().collection("spendings").add({
    ...spending,
    time: new Date()
  })
}

export const editSpending = spending => {
  return firebase.firestore().collection("spendings").doc(spending.id).update(spending)
}

export const addCountry = country => {
  return firebase.firestore().collection('countries').add(country)
}

export const editCountry = country => {
  return firebase.firestore().collection('countries').doc(country.id).update(country)
}

export const addLocation = location => {
  return firebase.firestore().collection('locations').add(location)
}

export const editLocation = location => {
  return firebase.firestore().collection('locations').doc(location.id).update(location)
}

export const addSection = section => {
  return firebase.firestore().collection('sections').add(section)
}

export const editSection = section => {
  return firebase.firestore().collection('sections').doc(section.id).update(section)
}

export const addCategory = category => {
  return firebase.firestore().collection('categories').add(category)
}

export const editCategory = category => {
  return firebase.firestore().collection('categories').doc(category.id).update(category)
}

export const addTrademark = trademark => {
  return firebase.firestore().collection('trademarks').add(trademark)
}

export const editTrademark = trademark => {
  return firebase.firestore().collection('trademarks').doc(trademark.id).update(trademark)
}

export const resolveForgetPassword = transId => {
  return firebase.firestore().collection('forgetPassword').doc(transId).update({
    resolved: true
  })
}

export const addPack = pack => {
  return firebase.firestore().collection('packs').add(pack)
}

export const editPack = pack => {
  return firebase.firestore().collection('packs').doc(pack.id).update(pack)
}

export const addTag = tag => {
  return firebase.firestore().collection('tags').add(tag)
}

export const editTag = tag => {
  return firebase.firestore().collection('tags').doc(tag.id).update(tag)
}

export const editCustomer = (customer, name) => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(customer.id)
  batch.update(customerRef, customer)
  const userRef = firebase.firestore().collection('users').doc(customer.id)
  batch.update(userRef, {
    name
  })
  return batch.commit()
}

export const approveUser = user => {
  const batch = firebase.firestore().batch()
  const customerRef = firebase.firestore().collection('customers').doc(user.id)
  batch.set(customerRef, {
    name: user.name,
    storeId: user.storeId,
    address: user.address,
    orderLimit: 25000,
    withDelivery: false,
    locationId: user.locationId,
    discounts: 0,
    isOldAge: false,
    position: '',
    isBlocked: false,
    otherMobile: user.otherMobile,
    otherMobileHolder: user.otherMobileHolder,
    overPriceLimit: 0,
    time: new Date()
  })
  const userRef = firebase.firestore().collection('users').doc(user.id)
  batch.update(userRef, {
    name: user.name,
    storeName: firebase.firestore.FieldValue.delete(),
    locationId: firebase.firestore.FieldValue.delete()
  })
  return batch.commit()
}

export const approvePriceAlarm = (priceAlarm, pack, store, customer, storePacks, packs) => {
  const batch = firebase.firestore().batch()
  const storeId = customer.storeId || store.id
  const priceAlarmRef = firebase.firestore().collection('priceAlarms').doc(priceAlarm.id)
  batch.update(priceAlarmRef, {
    status: 'a',
    storeId: customer.storeId ? '' : store.id
  })  
  const storePack = storePacks.find(p => p.storeId === storeId && p.packId === priceAlarm.packId)
  const oldPrice = storePack.price
  if (priceAlarm.price > 0) {
    const newStorePack = { 
      ...storePack,
      storeId,
      cost: priceAlarm.price,
      price: priceAlarm.price,
      userId: priceAlarm.userId,
      offerEnd: priceAlarm.offerEnd,
      time: new Date(),
    }
    const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
    batch.update(storePackRef, newStorePack)
    if (newStorePack.price < pack.price || pack.price === 0 || pack.price === oldPrice) {
      const { minPrice, weightedPrice, hasOffer } = getMinPrice(newStorePack, pack, storePacks, packs, false)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        hasOffer
      })
    }
  } else {
    const storePackRef = firebase.firestore().collection('storePacks').doc(storePack.id)
    batch.delete(storePackRef)
    if (storePack.price === pack.price) {
      const { minPrice, weightedPrice, hasOffer } = getMinPrice(storePack, pack, storePacks, packs, true)
      const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
      batch.update(packRef, {
        price: minPrice,
        weightedPrice,
        hasOffer
      })
    }
  }
  if (!customer.storeId){
    const customerRef = firebase.firestore().collection('customers').doc(customer.id)
    batch.update(customerRef, {
      discounts: firebase.firestore.FieldValue.increment(labels.priceAlarmDiscount)
    })
  }
  return batch.commit()
}

export const rejectPriceAlarm = priceAlarm => {
  return firebase.firestore().collection('priceAlarms').doc(priceAlarm.id).update({
    status: 'r'
  })
}

export const packUnavailable = (pack, packPrice, orders, customers, overPriced) => {
  const batch = firebase.firestore().batch()
  const packOrders = orders.filter(o => o.basket.find(p => p.packId === pack.id && p.price === packPrice && (p.status === 'n' || p.status === 'p')))
  packOrders.forEach(o => {
    const orderPack = o.basket.find(p => p.packId === pack.id)
    const otherPacks = o.basket.filter(p => p.packId !== pack.id)
    let orderStatus = 'e'
    const basket = [
      ...otherPacks, 
      {
        ...orderPack,
        status: orderPack.purchased > 0 ? 'pu' : 'u',
        gross: parseInt((orderPack.actual || 0) * (orderPack.weight || orderPack.purchased)),
        overPriced
      }
    ]
    if (basket.length === basket.filter(p => p.status === 'u').length) {
      orderStatus = 'u'
    }else if (basket.length === basket.filter(p => ['f', 'u', 'pu'].includes(p.status)).length) {
      orderStatus = 'f'
    }
    const customer = customers.find(c => c.id === o.userId)
    const total = basket.reduce((sum, p) => sum + p.gross, 0)
    let fixedFees, fraction, profit
    let discount = {}
    if (total === 0) {
      fixedFees = 0
      fraction = 0
      profit = 0
      discount.value = 0
      discount.type = ''
    } else {
      profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
      fixedFees = Math.ceil(((o.urgent ? 1.5 : 1) * labels.fixedFees / 100 * total) / 50) * 50
      discount = o.discount
      switch (discount.type) {
        case 'f':
          discount.value = fixedFees
          break
        case 'p':
          discount.value = customer.discounts > 0 ? Math.min(customer.discounts, fixedFees, labels.maxDiscount) : 0
          break
        default:
      }
      fraction = total - Math.floor(total / 50) * 50
      discount.value = discount.value + fraction
    }
    const orderRef = firebase.firestore().collection('orders').doc(o.id)
    batch.update(orderRef, {
      basket,
      profit,
      total,
      fixedFees,
      discount,
      status: orderStatus,
      statusTime: new Date()
    })
  })
  return batch.commit()
}

export const addMonthlyTrans = trans => {
  return firebase.firestore().collection('monthlyTrans').doc(trans.id).set(trans)
}

export const editOrder = (order, basket, storePacks, packs, customer) => {
  const batch = firebase.firestore().batch()
  let returnBasket = basket.filter(p => p.quantity < p.purchased)
  if (returnBasket.length > 0){
    returnBasket = returnBasket.map(p => {
      return {
        ...p,
        quantity: addQuantity(p.purchased, p.quantity)
      }
    })
    stockIn(batch, 'i', returnBasket, storePacks, packs)
  }
  let packBasket = basket.filter(p => p.quantity > 0)
  packBasket = packBasket.map(p => {
    const status = p.quantity === p.purchased ? 'f' : p.purchased > 0 ? 'p' : 'n'
    return {
      ...p,
      purchased: Math.min(p.quantity, p.purchased),
      status,
      gross: status === 'n' ? parseInt(p.price * p.quantity) : parseInt(p.actual * (p.weight || p.purchased)) + parseInt(p.price * addQuantity(p.quantity, -1 * p.purchased))
    }
  })
  const total = packBasket.reduce((sum, p) => sum + p.gross, 0)
  const fixedFees = Math.ceil(((order.urgent ? 1.5 : 1) * labels.fixedFees / 100 * total) / 50) * 50
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = customer.discounts > 0 ? Math.min(customer.discounts, fixedFees, labels.maxDiscount) : 0
      break
    default:
  }
  const fraction = total - Math.floor(total / 50) * 50
  discount.value = discount.value + fraction
  const profit = packBasket.reduce((sum, p) => sum + ['p', 'f', 'pu'].includes(p.status) ? parseInt((p.actual - p.cost) * (p.weight || p.purchased)) : 0, 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
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
  const statusTime = orderStatus === order.status ? (order.statusTime || order.time) : new Date()
  batch.update(orderRef, {
    status: orderStatus,
    basket: packBasket,
    withDelivery: order.withDelivery,
    total,
    profit,
    fixedFees,
    discount,
    statusTime,
    editTime: new Date()
  })
  return batch.commit()
}

export const changePassword = async (oldPassword, newPassword) => {
  let user = firebase.auth().currentUser
  const email = user.email
  await firebase.auth().signInWithEmailAndPassword(email, oldPassword)
  user = firebase.auth().currentUser
  return user.updatePassword(newPassword)
}

export const approveRating = (rating, product, customerInfo) => {
  const batch = firebase.firestore().batch()
  const ratingRef = firebase.firestore().collection('ratings').doc(rating.id)
  batch.update(ratingRef, {
    status: 'a',
    userName: customerInfo.name
  })
  const oldRating = product.rating || 0
  const ratingCount = product.ratingCount || 0
  const newRating = ((oldRating * ratingCount) + (rating.value * 5)) / (ratingCount + 1)
  const productRef = firebase.firestore().collection("products").doc(rating.productId)
  batch.update(productRef, {
    rating: Math.round(newRating * 2) / 2,
    ratingCount: ratingCount + 1
  })
  const customerRef = firebase.firestore().collection('customers').doc(rating.userId)
  batch.update(customerRef, {
    discounts: firebase.firestore.FieldValue.increment(labels.ratingDiscount)
  })
  return batch.commit()
}

export const sendOrder = (order, position) => {
  return firebase.firestore().collection('orders').doc(order.id).update({
    position
  })
}

export const returnOrderPacks = (order, pack, returned, customers) => {
  const batch = firebase.firestore().batch()
  const orderPack = order.basket.find(p => p.packId === pack.id)
  const otherPacks = order.basket.filter(p => p.packId !== pack.id)
  let status, gross
  if (returned === 0 && orderPack.returned > 0) {
    if (pack.isDivided) {
      status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchased)) / orderPack.quantity * 100) <= labels.margin ? 'f' : 'pu'
    } else {
      status = orderPack.quantity === orderPack.purchased ? 'f' : 'pu'
    }
    gross = parseInt(orderPack.actual * (orderPack.weight || orderPack.purchased))
  } else {
    if (returned === (orderPack.weight || orderPack.purchased)) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = parseInt(orderPack.actual * addQuantity(orderPack.weight || orderPack.purchased, -1 * returned))
    }
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      status,
      gross,
      returned: pack.isDivided || !pack.byWeight ? returned : orderPack.purchased
    }
  ]
  const customer = customers.find(c => c.id === order.userId)
  const total = basket.reduce((sum, p) => sum + p.gross, 0)
  const fixedFees = Math.ceil(((order.urgent ? 1.5 : 1) * labels.fixedFees / 100 * total) / 50) * 50
  let discount = order.discount
  switch (discount.type) {
    case 'f':
      discount.value = fixedFees
      break;
    case 'p':
      discount.value = customer.discounts > 0 ? Math.min(customer.discounts, fixedFees, labels.maxDiscount) : 0
      break
    default:
  }
  const fraction = total - Math.floor(total / 50) * 50
  discount.value = discount.value + fraction
  const profit = basket.reduce((sum, p) => sum + ['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0, 0)
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees,
    discount
  })
  return batch.commit()
}

export const addStockTrans = (type, packId, quantity, cost, price, storePacks, packs, storeId) => {
  const batch = firebase.firestore().batch()
  const transRef = firebase.firestore().collection('stockTrans').doc()
  const packBasket = {
    packId,
    price,
    quantity,
    cost
  }
  const total = parseInt(price * quantity)
  batch.set(transRef, {
    basket: [packBasket],
    storeId: storeId || '',
    type,
    total,
    time: new Date()
  })
  packStockOut(batch, packBasket, storePacks, packs)
  return batch.commit()
}