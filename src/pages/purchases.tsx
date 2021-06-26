import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { iPurchase, iStore } from '../data/interfaces'

interface ExtendedPurchase extends iPurchase {
  storeInfo: iStore
}
const Purchases = () => {
  const { state } = useContext(StoreContext)
  const [purchases, setPurchases] = useState<ExtendedPurchase[]>([])
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.purchases.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time > p1.time ? 1 : -1)
    })
  }, [state.purchases, state.stores])

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.purchases} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.views.current.router.navigate('/archived-purchases/')}>
        <Icon material="backup"></Icon>
      </Fab>
      <Block>
        <List mediaList>
          {purchases.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : purchases.map(p => 
              <ListItem
                link={`/purchase-details/${p.id}/type/n`}
                title={p.storeInfo.name}
                subtitle={moment(p.time).fromNow()}
                after={(p.total / 100).toFixed(2)}
                key={p.id}
              />
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

export default Purchases
