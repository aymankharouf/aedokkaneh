import { useEffect, useState } from 'react'
import { quantityText, getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'
import { Basket, CustomerInfo, Order, Pack, PackPrice, RequestedPack, State, Store } from '../data/types'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
	id: string
}
const RequestedPacks = () => {
	const params = useParams<Params>()
	const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
	const statePacks = useSelector<State, Pack[]>(state => state.packs)
	const stateOrders = useSelector<State, Order[]>(state => state.orders)
	const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
	const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
	const stateStores = useSelector<State, Store[]>(state => state.stores)
	const [requestedPacks, setRequestedPacks] = useState<RequestedPack[]>([])
	useEffect(() => {
		setRequestedPacks(() => {
			const packs = getRequestedPacks(stateOrders, stateBasket!, statePacks)
			if (params.id){
				const result = packs.filter(p => {
					const basketStock = stateBasket?.storeId === 's' ? stateBasket.packs.find(bp => bp.packId === p.packId || statePacks.find(pa => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId))) : undefined
					const basketStockQuantity = ((basketStock?.quantity || 0) * (basketStock?.refQuantity || 0)) || 0
					const packStores = getPackStores(p.packInfo, statePackPrices, statePacks, basketStockQuantity)
					return packStores.find(ps => ps.storeId === params.id)
				})	
				return result
			}
			return packs
		})
	}, [params.id, stateBasket, stateOrders, statePacks, stateCustomers, stateStores, statePackPrices])
	let i = 0
	return(
    <IonPage>
			<Header title={`${labels.requestedPacks} ${params.id ? '-' + stateStores.find(s => s.id === params.id)?.name : ''}`} />
      <IonContent fullscreen className="ion-padding">
				<IonList>
					{requestedPacks.length === 0 ? 
						<IonItem> 
							<IonLabel>{labels.noData}</IonLabel>
						</IonItem>  
					: requestedPacks.map(p => 
							<IonItem key={i++} routerLink={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}`}>
								<IonThumbnail slot="start">
									<img src={p.packInfo.imageUrl} alt={labels.noImage} />
								</IonThumbnail>
								<IonLabel>
									<IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
									<IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
									<IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
									<IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
								</IonLabel>
								{p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
								<IonLabel slot="end" className="price">{p.offerId ? '' : (p.price / 100).toFixed(2)}</IonLabel>
								{p.offerId && <IonBadge slot="end" color="success">{(p.price / 100).toFixed(2)}</IonBadge>}
							</IonItem>    
						)
					}
				</IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default RequestedPacks