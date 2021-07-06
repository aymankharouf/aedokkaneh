import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { quantityText, getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'
import { RequestedPack } from '../data/types'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'

type Params = {
	id: string
}
const RequestedPacks = () => {
	const { state } = useContext(StateContext)
	const params = useParams<Params>()
	const [requestedPacks, setRequestedPacks] = useState<RequestedPack[]>([])
	useEffect(() => {
		setRequestedPacks(() => {
			const packs = getRequestedPacks(state.orders, state.basket!, state.packs)
			if (params.id){
				const result = packs.filter(p => {
					const basketStock = state.basket?.storeId === 's' ? state.basket.packs.find(bp => bp.packId === p.packId || state.packs.find(pa => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId))) : undefined
					const basketStockQuantity = ((basketStock?.quantity || 0) * (basketStock?.refQuantity || 0)) || 0
					const packStores = getPackStores(p.packInfo, state.packPrices, state.packs, basketStockQuantity)
					return packStores.find(ps => ps.storeId === params.id)
				})	
				return result
			}
			return packs
		})
	}, [params.id, state.basket, state.orders, state.packs, state.customers, state.stores, state.packPrices])
	let i = 0
	return(
    <IonPage>
			<Header title={`${labels.requestedPacks} ${params.id ? '-' + state.stores.find(s => s.id === params.id)?.name : ''}`} />
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
								{p.offerId && <IonBadge color="success">{(p.price / 100).toFixed(2)}</IonBadge>}
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