import { useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { addSpending, showMessage, showError, getMessage } from '../data/actionst'

const AddSpending = () => {
  const [error, setError] = useState('')
  const [type, setType] = useState('')
  const [amount, setAmount] = useState('')
  const [spendingDate, setSpendingDate] = useState([new Date()])
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState('')
  // useEffect(() => {
  //   const validateDate = value => {
  //     if (new Date(value) > new Date()){
  //       setSpendingDateErrorMessage(labels.invalidSpendingDate)
  //     } else {
  //       setSpendingDateErrorMessage('')
  //     }
  //   }
  //   if (spendingDate.length > 0) validateDate(spendingDate)
  //   else setSpendingDateErrorMessage('')
  // }, [spendingDate])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (Number(amount) <= 0 || Number(amount) !== Number(Number(amount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      // const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      const formatedDate = new Date()
      addSpending({
        type,
        amount: +amount * 100,
        spendingDate: formatedDate,
        description,
        time: new Date()
      })
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.newSpending} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="amount" 
          label={labels.amount}
          value={amount}
          clearButton 
          type="number" 
          onChange={e => setAmount(e.target.value)}
          onInputClear={() => setAmount('')}
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
            {spendingTypes.map(t => 
              <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="description" 
          label={labels.description}
          value={description}
          clearButton 
          type="text" 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
        <ListInput
          name="spendingDate"
          label={labels.spendingDate}
          type="datepicker"
          value={spendingDate} 
          clearButton
          errorMessage={spendingDateErrorMessage}
          errorMessageForce
          onCalendarChange={value => setSpendingDate(value)}
          onInputClear={() => setSpendingDate([])}
        />
      </List>
      {!amount || !type || !spendingDate || spendingDateErrorMessage ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddSpending
