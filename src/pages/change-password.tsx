import { useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Button } from 'framework7-react'
import { changePassword, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleSubmit = async () => {
    try{
      setInprocess(true)
      await changePassword(oldPassword, newPassword)
      setInprocess(false)
      showMessage(labels.changePasswordSuccess)
      f7.views.current.router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.changePassword} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.oldPassword}
          type="text"
          name="oldPassword"
          clearButton
          onChange={e => setOldPassword(e.target.value)}
          onInputClear={() => setOldPassword('')}
        />
        <ListInput
          label={labels.newPassword}
          type="text"
          name="newPassword"
          clearButton
          onChange={e => setNewPassword(e.target.value)}
          onInputClear={() => setNewPassword('')}
        />
      </List>
      {!oldPassword || !newPassword || oldPassword === newPassword ? '' :
        <Button text={labels.submit} large onClick={() => handleSubmit()} />
      }
    </Page>
  )
}
export default ChangePassword
