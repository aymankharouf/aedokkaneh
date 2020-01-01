import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Products = props => {
  const { state } = useContext(StoreContext)
  const products = useMemo(() => [...state.products].sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [state.products])
  return(
    <Page>
      <Navbar title={labels.allProducts} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
        <Block>
          <List className="searchbar-not-found">
            <ListItem title={labels.noData} />
          </List>
          <List mediaList className="search-list searchbar-found">
            {products.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : products.map(p => {
                return (
                  <ListItem
                    link={`/product-packs/${p.id}`}
                    title={p.name}
                    subtitle={state.categories.find(c => c.id === p.categoryId).name}
                    text={`${labels.productOf} ${state.countries.find(c => c.id === p.countryId).name}`}
                    key={p.id}
                  >
                    <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                  </ListItem>
                )
              })
            }
          </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-product/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Products