import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'


const Regions = () => {
  const { state } = useContext(StateContext)
  const [regions, setRegions] = useState(() => [...state.regions].sort((l1, l2) => l1.ordering - l2.ordering))
  useEffect(() => {
    setRegions(() => [...state.regions].sort((l1, l2) => l1.ordering - l2.ordering))
  }, [state.regions])
  return (
    <Page>
      <Navbar title={labels.regions} backLink={labels.back} />
      <Block>
        <List>
          {regions.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : regions.map(r =>
              <ListItem
                link={`/edit-region/${r.id}`}
                title={r.name}
                after={(r.fees / 100).toFixed(2)}
                key={r.id}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-region/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Regions
