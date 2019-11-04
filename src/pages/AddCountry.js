import React, { useState, useContext } from 'react'
import { addCountry, showMessage } from '../data/Actions'
import {Page, Navbar, List, ListInput, Fab, Icon, Toolbar} from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const AddCountry = props => {
  const { state } = useContext(StoreContext)
  const [name, setName] = useState('')
  const handleSubmit = () => {
    addCountry({
      name,
      isActive: false
    }).then(() => {
      showMessage(props, 'success', state.labels.addSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.addCountry} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name} 
          floatingLabel
          clearButton
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
      </List>
      {name ? 
        <Fab position="left-top" slot="fixed" color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
        : ''
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default AddCountry
