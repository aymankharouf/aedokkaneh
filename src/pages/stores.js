import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import { addStock, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const Stores = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [stores, setStores] = useState([])
  const [stock, setStock] = useState('')
  useEffect(() => {
    setStock(() => state.stores.find(s => s.id === 's'))
  }, [state.stores])
  useEffect(() => {
    setStores(() => {
      const today = new Date()
      today.setDate(today.getDate() - 30)
      let stores = state.stores.filter(s => s.id !== 's')
      stores = stores.map(s => {
        const storePurchases = state.purchases.filter(p => p.storeId === s.id && p.time.toDate() >= today)
        const sales = storePurchases.reduce((sum, p) => sum + p.total, 0)
        return {
          ...s,
          sales
        }
      })
      return stores.sort((s1, s2) => s1.sales - s2.sales)
    })
  }, [state.stores, state.purchases])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAddStock = name => {
    try{
      addStock(name)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.stores} backLink={labels.back} />
      <Block>
        <List>
          {stores.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stores.map(s =>
              <ListItem 
                link={`/store-details/${s.id}`} 
                title={s.name}
                after={s.discount * 100}
                key={s.id} 
              >
                {s.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-store/">
        <Icon material="add"></Icon>
      </Fab>
      {stock ? '' : 
        <Fab position="center-bottom" slot="fixed" color="red" text={labels.stockName} onClick={() => handleAddStock(labels.stockName)}>
          <Icon material="add"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Stores
