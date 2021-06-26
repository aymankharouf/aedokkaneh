import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'
import { quantityText } from '../data/actionst'
import labels from '../data/labels'
import { iPack, iPackPrice } from '../data/interfaces'

interface ExtendedPackPrice extends iPackPrice {
  packInfo: iPack
}
const Stock = () => {
  const { state } = useContext(StoreContext)
  const [stockPacks, setStockPacks] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setStockPacks(() => {
      const stockPacks = state.packPrices.filter(p => p.storeId === 's')
      const result = stockPacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
      return result.sort((p1, p2) => p1.time > p2.time ? 1 : -1)
    })
  }, [state.packPrices, state.packs])

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  let i = 0
  return(
    <Page>
      <Navbar title={labels.stock} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search" />
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        ></Searchbar>
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {stockPacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockPacks.map(p => 
              <ListItem
                link={`/stock-pack-trans/${p.packId}`}
                title={p.packInfo.productName}
                subtitle={p.packInfo.productAlias}
                text={p.packInfo.name}
                footer={`${labels.gross}: ${(p.cost * (p.weight || p.quantity)/ 100).toFixed(2)}`}
                after={(p.cost / 100).toFixed(2)}
                key={i++}
              >
                <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                <div className="list-subtext1">{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</div>
                {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link href="/stock-trans/" iconMaterial="layers" />
      </Toolbar>
    </Page>
  )
}

export default Stock
