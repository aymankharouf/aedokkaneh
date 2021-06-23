import { useState, useContext, useEffect } from 'react'
import { editLocation, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'

const EditLocation = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [location] = useState(() => state.locations.find(l => l.id === props.id))
  const [name, setName] = useState(location.name)
  const [fees, setFees] = useState((location.fees / 100).toFixed(2))
  const [ordering, setOrdering] = useState(location.ordering)
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== location.name
    || fees * 100 !== location.fees
    || ordering !== location.ordering) setHasChanged(true)
    else setHasChanged(false)
  }, [location, name, fees, ordering])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      if (Number(fees) < 0 || Number(fees) !== Number(Number(fees).toFixed(2))) {
        throw new Error('invalidValue')
      }
      const newLocation = {
        ...location,
        name,
        fees: fees * 100,
        ordering
      }
      editLocation(newLocation, state.locations)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editLocation} backLink={labels.back} />
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
          name="fees" 
          label={labels.fees}
          clearButton
          type="number" 
          value={fees} 
          onChange={e => setFees(e.target.value)}
          onInputClear={() => setFees('')}
        />
        <ListInput 
          name="ordering" 
          label={labels.ordering}
          clearButton
          type="number" 
          value={ordering} 
          onChange={e => setOrdering(e.target.value)}
          onInputClear={() => setOrdering('')}
        />
      </List>
      {!name || !fees || !ordering || !hasChanged ? '' :
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
export default EditLocation
