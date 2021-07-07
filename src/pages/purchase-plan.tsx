import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'
import { Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'

type ExtendedStore = Store & {
	sales: number,
	lastPack: string,
	packsCount: number
}
const PurchasePlan = () => {
	const { state } = useContext(StateContext)
	const [stores, setStores] = useState<ExtendedStore[]>([])
	const [approvedOrders] = useState(() => state.orders.filter(o => ['a', 'e'].includes(o.status)))
	useEffect(() => {
		const storesArray: ExtendedStore[] = []
		const today = new Date()
    today.setDate(today.getDate() - 30)
		const packs = getRequestedPacks(approvedOrders, state.basket!, state.packs)
		packs.forEach(p => {
			const basketStock = state.basket?.storeId === 's' ? state.basket.packs.find(bp => bp.packId === p.packId) : undefined
			const packStores = getPackStores(p.packInfo, state.packPrices, state.packs, (basketStock?.quantity || 0))
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
					const storeInfo = state.stores.find(s => s.id === ps.storeId)!
					const storePurchases = state.purchases.filter(pu => pu.storeId === ps.storeId && pu.time >= today)
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
	}, [state.basket, approvedOrders, state.stores, state.packs, state.customers, state.packPrices, state.purchases])
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