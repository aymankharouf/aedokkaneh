import { useContext, useEffect, useState } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveInvitation, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const InvitationDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [userInfo] = useState(() => state.users.find(u => u.id === props.userId))
  const [mobileCheck, setMobileCheck] = useState('')
  useEffect(() => {
    setMobileCheck(() => {
      if (state.users.find(u => u.mobile === props.mobile)) {
        return 'r'
      }
      if (state.invitations.find(i => i.userId !== props.userId && i.mobile === props.mobile)) {
        return 'o'
      }
      return 's'
    })
  }, [state.users, state.customers, state.invitations, props.mobile, props.userId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = () => {
    try{
      approveInvitation(userInfo, props.mobile, mobileCheck)
      showMessage(labels.approveSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.invitationDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="userName" 
          label={labels.user}
          value={`${userInfo.name}: ${userInfo.mobile}`}
          type="text"
          readonly
        />
        <ListInput 
          name="friendName" 
          label={labels.friendName}
          value={userInfo.friends.find(f => f.mobile === props.mobile).name}
          type="text"
          readonly
        />
        <ListInput 
          name="friendMobile" 
          label={labels.mobile}
          value={props.mobile}
          type="text"
          readonly
        />
        <ListInput 
          name="mobileCheck" 
          label={labels.mobileCheck}
          value={mobileCheck === 's' ? labels.notUsedMobile : (mobileCheck === 'r' ? labels.alreadyUser : labels.invitedByOther)}
          type="text"
          readonly
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>
    </Page>
  )
}
export default InvitationDetails
