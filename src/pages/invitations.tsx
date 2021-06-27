import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { Friend, UserInfo } from '../data/types'

type ExtendedFriend = Friend & {
  userInfo: UserInfo
}
const Invitations = () => {
  const { state } = useContext(StateContext)
  const [invitations, setInvitations] = useState<ExtendedFriend[]>([])
  useEffect(() => {
    setInvitations(() => {
      const invitations = state.invitations.filter(i => i.status === 'n')
      return invitations.map(i => {
        const userInfo = state.users.find(u => u.id === i.userId)!
        return {
          ...i,
          userInfo
        }
      })
    })
  }, [state.users, state.invitations])
  let j = 0
  return(
    <Page>
      <Navbar title={labels.invitations} backLink={labels.back} />
      <Block>
        <List mediaList>
          {invitations.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : invitations.map(i => 
              <ListItem
                link={`/invitation-details/${i.userInfo.id}/mobile/${i.mobile}`}
                title={`${i.userInfo.name}: ${i.userInfo.mobile}`}
                subtitle={`${i.name}: ${i.mobile}`}
                key={j++}
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

export default Invitations
