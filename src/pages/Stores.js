import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import { addStock, showMessage, showError, getMessage } from '../data/Actions'

const Stores = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const stores = useMemo(() => [...state.stores].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.stores])
  const stock = useMemo(() => state.stores.find(s => s.id === 's')
  , [state.stores])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleAddStock = async name => {
    try{
      await addStock(name)
      showMessage(props, state.labels.addSuccess)
      props.f7router.back()  
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={state.labels.stores} backLink={state.labels.back} />
      <Block>
        <List>
          {stores.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : stores.map(s =>
              <ListItem 
                link={`/storeDetails/${s.id}`} 
                title={s.name} 
                key={s.id} 
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/addStore/">
        <Icon material="add"></Icon>
      </Fab>
      {stock ? '' : 
        <Fab position="center-bottom" slot="fixed" color="red" text={state.labels.stockName} onClick={() => handleAddStock(state.labels.stockName)}>
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
