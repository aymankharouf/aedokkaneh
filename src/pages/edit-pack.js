import { useState, useContext, useEffect } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const EditPack = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [name, setName] = useState(pack.name)
  const [unitsCount, setUnitsCount] = useState(pack.unitsCount)
  const [isDivided, setIsDivided] = useState(pack.isDivided)
  const [byWeight, setByWeight] = useState(pack.byWeight)
  const [closeExpired, setCloseExpired] = useState(pack.closeExpired)
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(pack.specialImage)
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  useEffect(() => {
    if (name !== pack.name
    || unitsCount !== pack.unitsCount
    || isDivided !== pack.isDivided
    || byWeight !== pack.byWeight
    || closeExpired !== pack.closeExpired
    || specialImage !== pack.specialImage
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, unitsCount, isDivided, byWeight, closeExpired, specialImage, imageUrl])
  useEffect(() => {
    if (isDivided) {
      setByWeight(true)
    }
  }, [isDivided])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handleSubmit = () => {
    try{
      if (state.packs.find(p => p.id !== pack.id && p.productId === props.id && p.name === name && p.closeExpired === closeExpired)) {
        throw new Error('duplicateName')
      }
      const newPack = {
        ...pack,
        name,
        unitsCount: Number(unitsCount),
        isDivided,
        byWeight,
        closeExpired
      }
      editPack(newPack, pack, image, state.packs)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={`${labels.editPack} ${pack.productName}`} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          clearButton
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onInputClear={() => setName('')}
        />
        <ListInput 
          name="unitsCount" 
          label={labels.unitsCount}
          clearButton
          type="number" 
          value={unitsCount} 
          onChange={e => setUnitsCount(e.target.value)}
          onInputClear={() => setUnitsCount('')}
        />
        <ListItem>
          <span>{labels.isDivided}</span>
          <Toggle 
            name="isDivived" 
            color="green" 
            checked={isDivided} 
            onToggleChange={() => setIsDivided(!isDivided)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.byWeight}</span>
          <Toggle 
            name="byWeight" 
            color="green" 
            checked={byWeight} 
            onToggleChange={() => setByWeight(!byWeight)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.closeExpired}</span>
          <Toggle 
            name="closeExpired" 
            color="green" 
            checked={closeExpired} 
            onToggleChange={() => setCloseExpired(!closeExpired)}
          />
        </ListItem>
        <ListItem>
          <span>{labels.specialImage}</span>
          <Toggle 
            name="specialImage" 
            color="green" 
            checked={specialImage} 
            onToggleChange={() => setSpecialImage(!specialImage)}
          />
        </ListItem>
        {specialImage ? 
          <ListInput 
            name="image" 
            label={labels.image} 
            type="file" 
            accept="image/*" 
            onChange={e => handleFileChange(e)}
          />
        : ''}
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {!name || !unitsCount || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditPack
