import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { iUserInfo } from '../data/interfaces'


const NewUsers = () => {
  const { state } = useContext(StoreContext)
  const [newUsers, setNewUsers] = useState<iUserInfo[]>([])
  useEffect(() => {
    setNewUsers(() => {
      const newUsers = state.users.filter(u => !state.customers.find(c => c.id === u.id))
      return newUsers.sort((u1, u2) => u2.time > u1.time ? 1 : -1)
    })
  }, [state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.newUsers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {newUsers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : newUsers.map(u => 
              <ListItem
                link={`/approve-user/${u.id}`}
                title={`${labels.user}: ${u.name}`}
                subtitle={`${labels.mobile}: ${u.mobile}`}
                text={moment(u.time).fromNow()}
                key={u.id}
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

export default NewUsers
