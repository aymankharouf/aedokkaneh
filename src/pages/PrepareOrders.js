import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Block, Page, Navbar, Toolbar, List, ListItem } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actions'
import PackImage from './PackImage'
import labels from '../data/labels'

const PrepareOrders = props => {
  const { state } = useContext(StoreContext)
	const [packs, setPacks] = useState([])
	const finishedOrders = useMemo(() => state.orders.filter(o => o.status === 'f')
	, [state.orders])
	
	let i = 0
	useEffect(() => {
		let packsArray = []
		finishedOrders.forEach(o => {
			o.basket.forEach(p => {
				if (p.purchased > 0 && !p.isAllocated) {
					const found = packsArray.find(pa => pa.packId === p.packId)
					if (!p.weight && found) {
						packsArray = packsArray.filter(pa => pa.packId !== found.packId)
						packsArray.push({
							packId: p.packId,
							quantity: p.purchased + found.quantity
						})
					} else {
						packsArray.push({
							packId: p.packId,
							quantity: p.purchased,
							weight: p.weight,
							orderId: o.id
						})
					}
				}
			})
		})
		setPacks(packsArray)
	}, [finishedOrders])
  return(
    <Page>
      <Navbar title={labels.PurchasedProducts} backLink={labels.back} />
      <Block>
				<List mediaList>
					{packs.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: packs.map(p => {
							const packInfo = state.packs.find(pa => pa.id === p.packId)
							const weightText = p.weight && p.weight !== p.quantity ? `(${quantityText(p.weight)})` : '' 
							return (
								<ListItem
									link={`/prepareOrdersList/${p.packId}/order/${p.orderId || 0}`}
									title={state.products.find(pr => pr.id === packInfo.productId).name}
									subtitle={packInfo.name}
									text={`${labels.quantity}: ${quantityText(p.quantity)} ${weightText}`}
									key={i++}
								>
									<PackImage slot="media" pack={packInfo} type="list" />
								</ListItem>
							)
						})
					}
				</List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default PrepareOrders
