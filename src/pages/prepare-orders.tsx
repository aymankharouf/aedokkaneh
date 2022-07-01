import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Order, Pack, RequestedPack, State } from '../data/types'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

const PrepareOrders = () => {
	const stateOrders = useSelector<State, Order[]>(state => state.orders)
	const statePacks = useSelector<State, Pack[]>(state => state.packs)
	const packs = useMemo(() => {
			const finishedOrders = stateOrders.filter(o => o.status === 'f')
			const packsArray: RequestedPack[] = []
			finishedOrders.forEach(o => {
				o.basket.forEach(p => {
					if (p.purchased > 0 && !p.isAllocated) {
						const found = packsArray.findIndex(pa => pa.packId === p.packId)
						if (!p.weight && found > -1) {
							packsArray.splice(found, 1, {
								packId: p.packId,
								quantity: p.purchased + packsArray[found].quantity,
								weight: p.purchased + packsArray[found].weight,
								price: 0,
								orderId: '',
								offerId: '',
								packInfo: statePacks.find(pa => pa.id === p.packId)!
							})
						} else {
							packsArray.push({
								packId: p.packId,
								price: 0,
								quantity: p.purchased,
								weight: p.weight,
								orderId: o.id!,
								offerId: '',
								packInfo: statePacks.find(pa => pa.id === p.packId)!
							})
						}
					}
				})
			})
			return packsArray
	}, [stateOrders, statePacks])
	let i = 0
  return(
    <IonPage>
			<Header title={labels.PurchasedProducts} />
      <IonContent fullscreen className="ion-padding">
				<IonList>
					{packs.length === 0 ? 
						<IonItem> 
							<IonLabel>{labels.noData}</IonLabel>
						</IonItem> 
					: packs.map(p => 
							<IonItem key={i++} routerLink={`/prepare-orders-list/${p.packId}/order/${p.orderId || 0}`}>
								<IonThumbnail slot="start">
									<img src={p.packInfo.imageUrl} alt={labels.noImage} />
								</IonThumbnail>
								<IonLabel>
									<IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
									<IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
									<IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
									<IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
								</IonLabel>
								{p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
							</IonItem>    
						)
					}
				</IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default PrepareOrders
