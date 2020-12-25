import { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Toolbar, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { resolvePasswordRequest, showMessage, showError, getMessage } from '../data/actions'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const RetreivePassword = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [passwordRequest] = useState(() => state.passwordRequests.find(r => r.id === props.id))
  const [userInfo] = useState(() => state.users.find(u => u.mobile === passwordRequest.mobile))
  const [password] = useState(() => {
    const password = userInfo?.colors?.map(c => randomColors.find(rc => rc.name === c).id)
    return password?.join('')
  })
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleResolve = () => {
    try{
      resolvePasswordRequest(props.id)
      showMessage(labels.sendSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.retreivePassword} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          value={userInfo?.name || labels.unknown}
          type="text" 
          readonly
        />
        <ListInput 
          name="mobile" 
          label={labels.mobile}
          value={passwordRequest.mobile}
          type="number"
          readonly
        />
        <ListInput 
          name="password" 
          label={labels.password}
          value={password || ''}
          type="number"
          readonly
        />
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleResolve()}>
        <Icon material="done"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default RetreivePassword