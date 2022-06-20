import { useEffect, useState } from 'react'
import { getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'
import { Basket, CustomerInfo, Order, Pack, PackPrice, Purchase, State, Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type ExtendedStore = Store & {
	sales: number,
	lastPack: string,
	packsCount: number
}
const PurchasePlan = () => {
	const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
	const statePacks = useSelector<State, Pack[]>(state => state.packs)
	const stateStores = useSelector<State, Store[]>(state => state.stores)
	const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
	const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
	const [stores, setStores] = useState<ExtendedStore[]>([])
	const [approvedOrders] = useState(() => stateOrders.filter(o => ['a', 'e'].includes(o.status)))
	useEffect(() => {
		const storesArray: ExtendedStore[] = []
		const today = new Date()
    today.setDate(today.getDate() - 30)
		const packs = getRequestedPacks(approvedOrders, stateBasket!, statePacks)
		packs.forEach(p => {
			const basketStock = stateBasket?.storeId === 's' ? stateBasket.packs.find(bp => bp.packId === p.packId) : undefined
			const packStores = getPackStores(p.packInfo, statePackPrices, statePacks, (basketStock?.quantity || 0))
			packStores.forEach(ps => {
				const found = storesArray.findIndex(s => s.id === ps.storeId)
				if (found > -1) {
					if (storesArray[found].lastPack !== p.packId) {
						storesArray.splice(found, 1, {
							...storesArray[found],
							lastPack: p.packId,
							packsCount: storesArray[found].packsCount + 1
						})
					}
				} else {
					const storeInfo = stateStores.find(s => s.id === ps.storeId)!
					const storePurchases = statePurchases.filter(pu => pu.storeId === ps.storeId && pu.time >= today)
					storesArray.push({
						...storeInfo,
						sales: storePurchases.reduce((sum, pu) => sum + pu.total, 0),
						lastPack: p.packId,
						packsCount: 1
					})
				}
			})
		})
		storesArray.sort((s1, s2) => {
			if (s1.type === s2.type){
				if (s1.discount === s2.discount) {
					return s1.sales - s2.sales
				} else {
					return s2.discount - s1.discount
				}
			} else {
				return Number(s1.type) - Number(s2.type)
			}
		})
		setStores(storesArray)
	}, [stateBasket, approvedOrders, stateStores, statePacks, stateCustomers, statePackPrices, statePurchases])
	let i = 0
	return(
    <IonPage>
			<Header title={labels.purchasePlan} />
      <IonContent fullscreen>
				<IonList>
					{stores.length === 0 ? 
						<IonItem> 
							<IonLabel>{labels.noData}</IonLabel>
						</IonItem> 
					: stores.map(s => 
							<IonItem key={i++} routerLink={`/purchase-plan-details/${s.id}`}>
								<IonLabel>
									<IonText style={{color: colors[0].name}}>{s.name}</IonText>
									<IonText style={{color: colors[1].name}}>{s.id === 's' ? '' : `${labels.discount}: ${s.discount}`}</IonText>
									<IonText style={{color: colors[2].name}}>{s.id === 's' ? '' : `${labels.sales}: ${(s.sales / 100).toFixed(2)}`}</IonText>
								</IonLabel>
								<IonLabel slot="end" className="price">{s.packsCount}</IonLabel>
							</IonItem>
						)
					}
				</IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default PurchasePlan