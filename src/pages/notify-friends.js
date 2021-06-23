import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { approveNotifyFriends, showMessage, showError, getMessage } from '../data/actions'

const NotifyFriends = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [notifyFriends, setNotifyFriends] = useState([])
  useEffect(() => {
    setNotifyFriends(() => {
      let notifyFriends = []
      let users = state.users.filter(u => u.notifyFriends)
      users.forEach(u => {
        u.notifyFriends.forEach(n => {
          notifyFriends.push({
            userInfo: u,
            packInfo: state.packs.find(p => p.id === n),
          })
        })
      })
      return notifyFriends
    })
  }, [state.users, state.packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = (userInfo, pack) => {
    try{
      approveNotifyFriends(userInfo, pack, state.users)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.notifyFriends} backLink={labels.back} />
      <Block>
        <List mediaList>
          {notifyFriends.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : notifyFriends.map(n => 
              <ListItem
                title={n.packInfo.productName}
                subtitle={`${n.userInfo.name}:${n.userInfo.mobile}`}
                key={i++}
              >
                <img slot="media" src={n.packInfo.imageUrl} className="img-list" alt={n.packInfo.productName} />
                <Button text={labels.approve} slot="after" onClick={() => handleApprove(n.userInfo, n.packInfo)} />
              </ListItem>
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

export default NotifyFriends
