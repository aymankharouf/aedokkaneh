import React, { useContext, useState, useEffect } from 'react'
import { addNotification, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { StoreContext } from '../data/store'


const AddNotification = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [customers] = useState(() => [...state.customers].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
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
      await addNotification(userId, title, message)
      setInprocess(false)
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.addNotification} backLink={labels.back} />
      <List form>
        <ListItem
          title={labels.toCustomer}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="userId" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value=""></option>
            {customers.map(c => 
              <option key={c.id} value={c.id}>{c.fullName}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="title" 
          label={labels.title} 
          floatingLabel
          clearButton
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onInputClear={() => setTitle('')}
        />
        <ListInput 
          name="message" 
          label={labels.message} 
          floatingLabel
          clearButton
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onInputClear={() => setMessage('')}
        />
      </List>
      {!userId || !title || !message ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default AddNotification
