import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RelatedProducts = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const relatedProducts = useMemo(() => {
    const relatedProducts = state.products.filter(p => p.id !== props.id && p.tagId === product.tagId)
    return relatedProducts.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.products, product, props.id])
  return(
    <Page>
      <Navbar title={state.labels.relatedProducts} backLink={state.labels.back} className="page-title" />
        <Block>
          <List mediaList>
            {relatedProducts.length === 0 ? 
              <ListItem title={state.labels.noData} /> 
            : relatedProducts.map(p => {
                return (
                  <ListItem
                    link={`/product/${p.id}`}
                    title={p.name}
                    key={p.id}
                  >
                    <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                    <div className="list-line1">{state.categories.find(c => c.id === p.categoryId).name}</div>
                    <div className="list-line2">{`${state.labels.productOf} ${state.countries.find(c => c.id === p.countryId).name}`}</div>
                    {p.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : ''}
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

export default RelatedProducts