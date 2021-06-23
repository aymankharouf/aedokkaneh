import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import { editProduct, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const EditProduct = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [product] = useState(() => state.products.find(p => p.id === props.id))
  const [name, setName] = useState(product.name)
  const [alias, setAlias] = useState(product.alias)
  const [description, setDescription] = useState(product.description)
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [trademark, setTrademark] = useState(product.trademark)
  const [country, setCountry] = useState(product.country)
  const [imageUrl, setImageUrl] = useState(product.imageUrl)
  const [image, setImage] = useState('')
  const [fileErrorMessage, setFileErrorMessage] = useState('')
  const [hasChanged, setHasChanged] = useState(false)
  const [categories] = useState(() => [...state.categories].sort((c1, c2) => c1.name > c2.name ? 1 : -1))
  const [countries] = useState(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setFileErrorMessage(labels.invalidFile)
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  useEffect(() => {
    if (name !== product.name
    || alias !== product.alias
    || description !== product.description
    || country !== product.country
    || categoryId !== product.categoryId
    || trademark !== product.trademark
    || imageUrl !== product.imageUrl) setHasChanged(true)
    else setHasChanged(false)
  }, [product, name, alias, description, country, categoryId, trademark, imageUrl])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.products.find(p => p.id !== product.id && p.categoryId === categoryId && p.country === country && p.name === name && p.alias === alias)) {
        throw new Error('duplicateProduct')
      }
      const newProduct = {
        ...product,
        categoryId,
        name,
        alias,
        description,
        trademark,
        country,
      }
      editProduct(newProduct, product.name, image, state.packs)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editProduct} backLink={labels.back} />
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
          name="alias" 
          label={labels.alias}
          clearButton
          type="text" 
          value={alias} 
          onChange={e => setAlias(e.target.value)}
          onInputClear={() => setAlias('')}
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
          name="trademark" 
          label={labels.trademark}
          clearButton
          type="text" 
          value={trademark} 
          onChange={e => setTrademark(e.target.value)}
          onInputClear={() => setTrademark('')}
        />
        <ListItem
          title={labels.category}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="categoryId" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value=""></option>
            {categories.map(c => 
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
          </select>
        </ListItem>
        <ListItem
          title={labels.country}
          smartSelect
          smartSelectParams={{
            openIn: "popup", 
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="country" value={country} onChange={e => setCountry(e.target.value)}>
            <option value=""></option>
            {countries.map(c => 
              <option key={c} value={c}>{c}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="image" 
          label="Image" 
          type="file" 
          accept="image/*" 
          errorMessage={fileErrorMessage}
          errorMessageForce
          onChange={e => handleFileChange(e)}
        />
        <img src={imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      {!name || !categoryId || !country || !hasChanged ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default EditProduct
