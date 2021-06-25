import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { iSpending } from '../data/interfaces'

const Spendings = () => {
  const { state } = useContext(StoreContext)
  const [spendings, setSpendings] = useState<iSpending[]>([])
  useEffect(() => {
    setSpendings(() => [...state.spendings].sort((s1, s2) => s2.time > s1.time ? 1 : -1))
  }, [state.spendings])

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.spendings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {spendings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : spendings.map(s => {
              return (
                <ListItem
                  link={`/edit-spending/${s.id}`}
                  title={spendingTypes.find(t => t.id === s.type)?.name}
                  subtitle={moment(s.time).fromNow()}
                  after={(s.amount / 100).toFixed(2)}
                  key={s.id}
                />
              )
            })
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-spending/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
