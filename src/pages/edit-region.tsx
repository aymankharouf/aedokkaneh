import { useState, useContext, useEffect } from 'react'
import { editRegion, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'

type Props = {
  id: string
}
const EditRegion = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [region] = useState(() => state.regions.find(r => r.id === props.id)!)
  const [name, setName] = useState(region.name)
  const [fees, setFees] = useState((region.fees / 100).toFixed(2))
  const [ordering, setOrdering] = useState(region.ordering.toString())
  const [hasChanged, setHasChanged] = useState(false)
  useEffect(() => {
    if (name !== region.name
    || +fees * 100 !== region.fees
    || +ordering !== region.ordering) setHasChanged(true)
    else setHasChanged(false)
  }, [region, name, fees, ordering])
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
      const newRegion = {
        ...region,
        name,
        fees: +fees * 100,
        ordering: +ordering
      }
      editRegion(newRegion, state.regions)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editRegion} backLink={labels.back} />
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
          label={labels.deliveryFees}
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
export default EditRegion
