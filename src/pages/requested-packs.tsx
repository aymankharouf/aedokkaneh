import { useContext, useEffect, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import { quantityText, getRequestedPacks, getPackStores } from '../data/actions'
import labels from '../data/labels'
import { RequestedPack } from '../data/types'

type Props = {
	id: string
}
const RequestedPacks = (props: Props) => {
	const { state } = useContext(StateContext)
	const [requestedPacks, setRequestedPacks] = useState<RequestedPack[]>([])
	useEffect(() => {
		setRequestedPacks(() => {
			const packs = getRequestedPacks(state.orders, state.basket!, state.packs)
			if (props.id){
				const result = packs.filter(p => {
					const basketStock = state.basket?.storeId === 's' ? state.basket.packs.find(bp => bp.packId === p.packId || state.packs.find(pa => pa.id === bp.packId && (pa.subPackId === p.packId || pa.bonusPackId === p.packId))) : undefined
					const basketStockQuantity = ((basketStock?.quantity || 0) * (basketStock?.refQuantity || 0)) || 0
					const packStores = getPackStores(p.packInfo, state.packPrices, state.packs, basketStockQuantity)
					return packStores.find(ps => ps.storeId === props.id)
				})	
				return result
			}
			return packs
		})
	}, [props.id, state.basket, state.orders, state.packs, state.customers, state.stores, state.packPrices])
	let i = 0
	return(
    <Page>
      <Navbar title={`${labels.requestedPacks} ${props.id ? '-' + state.stores.find(s => s.id === props.id)?.name : ''}`} backLink={labels.back} />
      <Block>
				<List mediaList>
					{requestedPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: requestedPacks.map(p => 
							<ListItem
								link={`/requested-pack-details/${p.packId}/quantity/${p.quantity}/price/${p.price}/order/${p.orderId}`}
								title={p.packInfo.productName}
								subtitle={p.packInfo.productAlias}
								text={p.packInfo.name}
								after={p.offerId ? '' : (p.price / 100).toFixed(2)}
								key={i++}
							>
								<img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
								<div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
								{p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
								{p.offerId ? <Badge slot="after" color="green">{(p.price / 100).toFixed(2)}</Badge> : ''}
							</ListItem>
						)
					}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RequestedPacks