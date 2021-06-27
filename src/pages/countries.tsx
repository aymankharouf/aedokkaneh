import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'


const Countries = () => {
  const { state } = useContext(StateContext)
  const [countries, setCountries] = useState(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  }, [state.countries])
  let i = 0
  return (
    <Page>
      <Navbar title={labels.countries} backLink={labels.back} />
      <Block>
        <List>
          {countries.length === 0 ? 
            <ListItem title={labels.noData} />
          : countries.map(c =>
              <ListItem
                link={`/edit-country/${c}`}
                title={c} 
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-country/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Countries
