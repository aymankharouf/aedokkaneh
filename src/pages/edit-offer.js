import { useState, useContext, useEffect } from 'react'
import { editPack, showMessage, showError, getMessage } from '../data/actions'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon, BlockTitle, Toggle } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const EditOffer = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [name, setName] = useState(pack.name)
  const [subPackId, setSubPackId] = useState(pack.subPackId)
  const [subQuantity, setSubQuantity] = useState(pack.subQuantity)
  const [subPercent, setSubPercent] = useState(pack.subPercent * 100)
  const [bonusPackId, setBonusPackId] = useState(pack.bonusPackId)
  const [bonusQuantity, setBonusQuantity] = useState(pack.bonusQuantity)
  const [bonusPercent, setBonusPercent] = useState(pack.bonusPercent * 100)
  const [hasChanged, setHasChanged] = useState(false)
  const [specialImage, setSpecialImage] = useState(pack.specialImage)
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState(pack.imageUrl)
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.productId === pack.productId && !p.isOffer && !p.byWeight && p.forSale)
    return packs.map(p => {
      return {
        id: p.id,
        name: `${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
  })
  const [bonusPacks] = useState(() => {
    let packs = state.packs.filter(p => p.productId !== pack.productId && !p.subPackId && !p.byWeight)
    packs = packs.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name} ${p.closeExpired ? '(' + labels.closeExpired + ')' : ''}`
      }
    })
    return packs.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }) 
  useEffect(() => {
    if (name !== pack.name
    || subPackId !== pack.subPackId
    || subQuantity !== pack.subQuantity
    || subPercent !== pack.subPercent * 100
    || bonusPackId !== pack.bonusPackId
    || bonusQuantity !== pack.bonusQuantity * 100
    || bonusPercent !== pack.bonusPercent
    || specialImage !== pack.specialImage
    || imageUrl !== pack.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [pack, name, subPackId, subQuantity, subPercent, bonusPackId, bonusQuantity, bonusPercent, specialImage, imageUrl])
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
      const subPackInfo = state.packs.find(p => p.id === subPackId)
      const bonusPackInfo = state.packs.find(p => p.id === bonusPackId)
      if (state.packs.find(p => p.id !== pack.id && p.productId === props.id && p.name === name && p.closeExpired === subPackInfo.closeExpired)) {
        throw new Error('duplicateName')
      }
      if (Number(subPercent) + Number(bonusPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      if (bonusPackInfo && Number(bonusPercent) === 0) {
        throw new Error('invalidPercents')
      }
      if (bonusPackInfo && Number(bonusQuantity) === 0) {
        throw new Error('invalidQuantity')
      }
      if (!bonusPackInfo && Number(subQuantity) <= 1) {
        throw new Error('invalidQuantity')
      }
      const newPack = {
        ...pack,
        name,
        subPackId,
        subQuantity: Number(subQuantity),
        unitsCount: subQuantity * subPackInfo.unitsCount,
        subPercent: subPercent / 100,
        subPackName: subPackInfo.name,
        isDivided: subPackInfo.isDivided,
        byWeight: subPackInfo.byWeight,
        closeExpired: subPackInfo.closeExpired,
        bonusPackId,
        bonusProductName: bonusPackInfo?.productName || '',
        bonusPackName: bonusPackInfo?.name || '',
        bonusQuantity: Number(bonusQuantity),
        bonusPercent: bonusPercent / 100
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
      <Navbar title={`${labels.editOffer} ${pack.productName}`} backLink={labels.back} />
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
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="subPackId" value={subPackId} onChange={e => setSubPackId(e.target.value)}>
            <option value=""></option>
            {packs.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="subQuantity" 
          label={labels.quantity}
          value={subQuantity}
          clearButton
          type="number" 
          onChange={e => setSubQuantity(e.target.value)}
          onInputClear={() => setSubQuantity('')}
        />
        <ListInput 
          name="subPercent" 
          label={labels.percent}
          value={subPercent}
          clearButton
          type="number" 
          onChange={e => setSubPercent(e.target.value)}
          onInputClear={() => setSubPercent('')}
        />
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
      <BlockTitle>
        {labels.bonusProduct}
      </BlockTitle>
      <List form inlineLabels>
        <ListItem
          title={labels.pack}
          smartSelect
          smartSelectParams={{
            openIn: 'popup', 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="bonusPackId" value={bonusPackId} onChange={e => setBonusPackId(e.target.value)}>
            <option value=""></option>
            {bonusPacks.map(p => 
              <option key={p.id} value={p.id}>{p.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="bonusQuantity" 
          label={labels.quantity}
          value={bonusQuantity}
          clearButton
          type="number" 
          onChange={e => setBonusQuantity(e.target.value)}
          onInputClear={() => setBonusQuantity('')}
        />
        <ListInput 
          name="bonusPercent" 
          label={labels.percent}
          value={bonusPercent}
          clearButton
          type="number" 
          onChange={e => setBonusPercent(e.target.value)}
          onInputClear={() => setBonusPercent('')}
        />
      </List>
      {!name || !subPackId || !subQuantity || !subPercent || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditOffer
