import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'

const Offers = props => {
  const { state } = useContext(StoreContext)
  const storePacks = useMemo(() => {
    const storePacks = state.storePacks.filter(p => p.offerEnd)
    return storePacks.sort((p1, p2) => p1.offerEnd.seconds - p2.offerEnd.seconds)
  }, [state.storePacks])
  return(
    <Page>
      <Navbar title={state.labels.EndedOffers} backLink={state.labels.back} className="page-title" />
        <Block>
          <List mediaList>
            {storePacks.length === 0 ? 
              <ListItem title={state.labels.noData} /> 
            : storePacks.map(p => {
                const packInfo = state.packs.find(pa => pa.id === p.packId)
                const productInfo = state.products.find(pr => pr.id === packInfo.productId)
                const storeName = p.storeId ? (p.storeId === 'm' ? state.labels.multipleStores : state.stores.find(s => s.id === p.storeId).name) : ''
                return (
                  <ListItem
                    link={`/storePack/${p.id}`}
                    title={productInfo.name}
                    after={(p.price / 1000).toFixed(3)}
                    key={p.id}
                  >
                    <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                    <div className="list-line1">{packInfo.name}</div>
                    <div className="list-line2">{`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.countryId).name}`}</div>
                    {storeName ? <div className="list-line3">{`${state.labels.storeName}: ${storeName}`}</div> : ''}
                    <div className="list-line4">{moment(p.offerEnd.toDate()).format('DD/MM/YYYY')}</div>
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

export default Offers