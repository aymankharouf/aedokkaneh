import { useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Button, Toolbar, Link } from 'framework7-react'
import { login, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const Login = props => {
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
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

  const handleLogin = async () => {
    try{
      setInprocess(true)
      await login(email, password)
      setInprocess(false)
      showMessage(labels.loginSuccess)
      f7.views.current.router.back()
      f7.views.current.router.app.panel.close('right')  
    } catch(err) {
      setInprocess(false)
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.login} backLink={labels.back} />
      <List form>
        <ListInput
          label={labels.email}
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <ListInput
          label={labels.password}
          type="text"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </List>
      {!email || !password ? '' : 
        <Button text={labels.logon} large onClick={() => handleLogin()} />
      }
      <Toolbar bottom>
        <Link href="/register/">{labels.registerTitle}</Link>
        <Link href="/change-password/">{labels.changePassword}</Link>
      </Toolbar>

    </Page>
  )
}
export default Login
