import { useState, useContext, useEffect } from 'react'
import { editSpending, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar, ListItem } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'

type Props = {
  id: string
}
const EditSpending = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [spending] = useState(() => state.spendings.find(s => s.id === props.id)!)
  const [type, setType] = useState(spending.type)
  const [amount, setAmount] = useState((spending.amount / 100).toFixed(2))
  const [spendingDate, setSpendingDate] = useState(() => spending.spendingDate ? [spending.spendingDate] : '')
  const [spendingDateErrorMessage, setSpendingDateErrorMessage] = useState('')
  const [description, setDescription] = useState(spending.description)
  const [hasChanged, setHasChanged] = useState(false)
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
  const handleEdit = () => {
    try{
      if (Number(amount) <= 0 || Number(amount) !== Number(Number(amount).toFixed(2))) {
        throw new Error('invalidValue')
      }
      // const formatedDate = spendingDate.length > 0 ? new Date(spendingDate) : ''
      const formatedDate = new Date()
      const newSpending = {
        ...spending,
        type,
        amount: +amount * 100,
        spendingDate: formatedDate,
        description
      }
      editSpending(newSpending)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}    
  }
  useEffect(() => {
    if (+amount * 100 !== spending.amount
    || type !== spending.type
    || description !== spending.description
    || (!spending.spendingDate && spendingDate.length > 0)
    || (spending.spendingDate && spendingDate.length === 0)
    // || (spending.spendingDate.toDate()).toString() !== (new Date(spendingDate)).toString()
    ) setHasChanged(true)
    else setHasChanged(false)
  }, [spending, amount, spendingDate, type, description])

  return (
    <Page>
      <Navbar title={labels.editSpending} backLink={labels.back} />
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
      {!amount || !type || !spendingDate || spendingDateErrorMessage || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditSpending
