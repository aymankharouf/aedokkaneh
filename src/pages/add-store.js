import React, { useState, useEffect } from 'react'
import { addStore, showMessage, showError, getMessage } from '../data/actions'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toolbar, Toggle } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { storeTypes } from '../data/config'

const AddStore = props => {
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mobileErrorMessage, setMobileErrorMessage] = useState('')
  const [address, setAddress] = useState('')
  const [discount, setDiscount] = useState('')
  const [mapPosition, setMapPosition] = useState('')
  const [allowReturn, setAllowReturn] = useState(false)
  const [openTime, setOpenTime] = useState('')

  useEffect(() => {
    const patterns = {
      mobile: /^07[7-9][0-9]{7}$/
    }
    const validateMobile = (value) => {
      if (patterns.mobile.test(value)){
        setMobileErrorMessage('')
      } else {
        setMobileErrorMessage(labels.invalidMobile)
      }
    }
    if (mobile) validateMobile(mobile)
    else setMobileErrorMessage('')
  }, [mobile])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    if (discount && discount <= 0) {
      throw new Error('invalidValue')
    }
    try{
      addStore({
        name,
        type,
        discount : discount / 100,
        mobile,
        mapPosition,
        allowReturn,
        openTime,
        address,
        balance: 0,
        time: new Date()
      })
      showMessage(labels.addSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.newStore} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          value={name}
          clearButton 
          type="text" 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput
          name="mobile"
          label={labels.mobile}
          value={mobile}
          clearButton
          type="number"
          errorMessage={mobileErrorMessage}
          errorMessageForce
          onChange={e => setMobile(e.target.value)}
          onInputClear={() => setMobile('')}
        />
        <ListItem
          title={labels.type}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="type" value={type} onChange={e => setType(e.target.value)}>
            <option value=""></option>
            {storeTypes.map(t => 
              t.id === '1' ? '' : <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput
          name="discount"
          label={labels.discount}
          value={discount}
          clearButton
          type="number"
          onChange={e => setDiscount(e.target.value)}
          onInputClear={() => setDiscount('')}
        />
        <ListItem>
          <span>{labels.allowReturn}</span>
          <Toggle 
            name="allowReturn" 
            color="green" 
            checked={allowReturn} 
            onToggleChange={() => setAllowReturn(!allowReturn)}
          />
        </ListItem>
        <ListInput
          name="openTime"
          label={labels.openTime}
          value={openTime}
          clearButton
          type="text"
          onChange={e => setOpenTime(e.target.value)}
          onInputClear={() => setOpenTime('')}
        />
        <ListInput
          name="mapPosition"
          label={labels.mapPosition}
          value={mapPosition}
          clearButton
          type="text"
          onChange={e => setMapPosition(e.target.value)}
          onInputClear={() => setMapPosition('')}
        />
        <ListInput 
          name="address" 
          label={labels.address}
          value={address}
          clearButton 
          type="textarea" 
          onChange={e => setAddress(e.target.value)}
          onInputClear={() => setAddress('')}
        />
      </List>
      {!name || !type || mobileErrorMessage ? '' :
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
export default AddStore
