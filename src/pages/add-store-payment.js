import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { addStorePayment, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { paymentTypes } from '../data/config'

const AddStorePayment = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [paymentDate, setPaymentDate] = useState([new Date()])
  const [paymentDateErrorMessage, setPaymentDateErrorMessage] = useState('')
  useEffect(() => {
    const validateDate = value => {
      if (new Date(value) > new Date()){
        setPaymentDateErrorMessage(labels.invalidSpendingDate)
      } else {
        setPaymentDateErrorMessage('')
      }
    }
    if (paymentDate.length > 0) validateDate(paymentDate)
    else setPaymentDateErrorMessage('')
  }, [paymentDate])
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
      const formatedDate = paymentDate.length > 0 ? new Date(paymentDate) : ''
      const payment = {
        type,
        description,
        amount: amount * 100,
        paymentDate: formatedDate,
        time: new Date()
      }
      addStorePayment(store.id, payment, state.stores)
      showMessage(labels.addSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.addPayment} ${store.name}`} backLink={labels.back} />
      <List form inlineLabels>
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
            {paymentTypes.map(t => 
              t.id === '1' ? '' : <option key={t.id} value={t.id}>{t.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="amount" 
          label={labels.amount}
          clearButton 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)}
          onInputClear={() => setAmount('')}
        />
        <ListInput 
          name="description" 
          label={labels.description}
          clearButton 
          type="text" 
          value={description} 
          onChange={e => setDescription(e.target.value)}
          onInputClear={() => setDescription('')}
        />
        <ListInput
          name="paymentDate"
          label={labels.paymentDate}
          type="datepicker"
          value={paymentDate} 
          clearButton
          errorMessage={paymentDateErrorMessage}
          errorMessageForce
          onCalendarChange={value => setPaymentDate(value)}
          onInputClear={() => setPaymentDate([])}
        />
      </List>
      {!amount || !type || !paymentDate || paymentDateErrorMessage? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddStorePayment
