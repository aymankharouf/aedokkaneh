import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { deleteLog, showMessage, showError, getMessage } from '../data/actions'


const Logs = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState([])
  useEffect(() => {
    setLogs(() => {
      const logs = state.logs.map(l => {
        const userInfo = state.users.find(u => u.id === l.userId)
        return {
          ...l,
          userInfo
        }
      })
      return logs.sort((l1, l2) => l2.time.seconds - l1.time.seconds)
    })
  }, [state.logs, state.users])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = log => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteLog(log)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }

  return(
    <Page>
      <Navbar title={labels.logs} backLink={labels.back} />
      <Block>
        <List mediaList>
          {logs.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : logs.map(l => 
              <ListItem
                title={`${labels.user}: ${l.userInfo?.name || l.userId}`}
                subtitle={l.userInfo?.mobile ? `${labels.mobile}: ${l.userInfo.mobile}` : ''}
                text={l.page}
                footer={moment(l.time.toDate()).fromNow()}
                key={l.id}
              >
                <div className="list-subtext1">{l.error}</div>
                <Button text={labels.delete} slot="after" onClick={() => handleDelete(l)} />
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

export default Logs
