import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { iCustomerInfo } from '../data/interfaces'

interface Props {
  id: string
}
const StoreOwners = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [storeOwners, setStoreOwners] = useState<iCustomerInfo[]>([])
  useEffect(() => {
    setStoreOwners(() => state.customers.filter(c => c.storeId === props.id))
  }, [state.customers, props.id])
  return (
    <Page>
      <Navbar title={`${labels.storeOwners} ${store.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storeOwners.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storeOwners.map(o => 
              <ListItem 
                link="#"
                title={o.name} 
                key={o.id} 
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

export default StoreOwners
