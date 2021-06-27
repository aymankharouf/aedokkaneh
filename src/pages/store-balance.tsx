import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { iBalance } from '../data/interfaces'

interface Props {
  id: string
}
const StoreBalance = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [store, setStore] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [balances, setBalances] = useState<iBalance[]>([])
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === props.id)!)
  }, [state.stores, props.id])
  useEffect(() => {
    setBalances(() => {
      const balances = store.balances?.slice() || []
      return balances.sort((b1, b2) => b2.month - b1.month)
    })
  }, [store])

  return(
    <Page>
      <Navbar title={`${labels.balanceTrans} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {balances.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : balances.map(b => {
              return (
                <ListItem
                  link={`/store-balance-trans/${props.id}/month/${b.month}`}
                  title={`${Math.trunc(b.month / 100)}-${b.month % 100}`}
                  after={(b.balance / 100).toFixed(2)}
                  key={b.month}
                />
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

export default StoreBalance
