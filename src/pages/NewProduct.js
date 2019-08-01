import React, {useState, useContext } from 'react'
import {Page, Navbar, List, ListItem, ListInput, Button, Block, Toggle} from 'framework7-react';
import { StoreContext } from '../data/Store';
import { newProduct } from '../data/Actions'


const NewProduct = props => {
  const { state, stores } = useContext(StoreContext)
  const store = stores.find(rec => rec.id === props.id)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [trademark, setTrademark] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [byWeight, setByWeight] = useState(false)
  const [country, setCountry] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const handleFileChange = e => {
    const files = e.target.files
    const filename = files[0].name
    if (filename.lastIndexOf('.') <= 0) {
      setError('Please add a valid file')
      return
    }
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      setImageUrl(fileReader.result)
    })
    fileReader.readAsDataURL(files[0])
    setImage(files[0])
  }
  const handlePurchasePriceChange = e => {
    const storeType = store ? store.storeType : null
    if (storeType === 'w') {
      const currentCategory = state.categories.find(rec => rec.id === category)
      const currentSection = currentCategory ? state.sections.find(rec => rec.id === currentCategory.section) : null
      const percent = currentSection ? currentSection.percent : 0
      setPrice(parseFloat((1 + (percent / 100)) * e.target.value).toFixed(3))
    } else {
      setPrice(e.target.value)
    }
    setPurchasePrice(e.target.value)
  }
  const handleSubmit = () => {
    try{
      if (name === '') {
        throw 'enter product name'
      }
      if (category === '') {
        throw 'enter product category'
      }
      if (quantity === '') {
        throw 'enter product quantity'
      }
      if (unit === '') {
        throw 'enter product unit'
      }
      if (country === '') {
        throw 'enter product country'
      }
      if (purchasePrice === '') {
        throw 'enter product purshase price'
      }
      if (price === '') {
        throw 'enter product price'
      }
      if (imageUrl === '') {
        throw 'enter product image'
      }
      newProduct({
        storeId: props.id,
        category,
        name,
        trademark,
        unit,
        byWeight,
        quantity,
        country,
        purchasePrice,
        price,
        imageUrl,
        image
      }).then(() => {
        props.f7router.navigate(`/store/${props.id}`)
      })  
    } catch (err){
      setError(err)
    }
  }
  const categoriesOptionsTags = state.categories.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const trademarksOptionsTags = state.trademarks.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const countriesOptionsTags = state.countries.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  const unitsOptionsTags = state.units.map(rec => <option key={rec.id} value={rec.id}>{rec.name}</option>)
  return (
    <Page>
      <Navbar title={`Add New Product to ${store.name}`} backLink="Back" />
      <List form>
        <ListInput name="name" label="Name" floatingLabel type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        <ListItem
          title="Category"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled></option>
            {categoriesOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title="Trademark"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search trademark'}}
        >
          <select name="trademark" value={trademark} onChange={(e) => setTrademark(e.target.value)}>
            <option value="" disabled></option>
            {trademarksOptionsTags}
          </select>
        </ListItem>
        <ListItem
          title="Country"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search country'}}
        >
          <select name="country" defaultValue="" onChange={(e) => setCountry(e.target.value)}>
            <option value="" disabled></option>
            {countriesOptionsTags}
          </select>
        </ListItem>
        <ListInput name="quantity" label="Quantity" floatingLabel type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
        <ListItem
          title="Unit"
          smartSelect
          smartSelectParams={{openIn: 'popup', closeOnSelect: true, searchbar: true, searchbarPlaceholder: 'Search unit'}}
        >
          <select name="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="" disabled></option>
            {unitsOptionsTags}
          </select>
        </ListItem>
        <ListItem>
          <span>Can be ordered by weight</span>
          <Toggle name="byWeight" color="green" checked={byWeight} disabled={unit === '2' || unit === '3' ? false : true} onToggleChange={() => setByWeight(!byWeight)}/>
        </ListItem>
        <ListInput name="purchacePrice" label="Purchase Price" value={purchasePrice} floatingLabel type="number" onChange={(e) => handlePurchasePriceChange(e)}/>
        <ListInput name="price" label="Price" value={price} floatingLabel type="number" onChange={(e) => setPrice(e.target.value)}/>
        <ListInput name="image" label="Image" type="file" accept="image/*" onChange={(e) => handleFileChange(e)}/>
        <img src={imageUrl} alt=""/>
        <Button fill onClick={() => handleSubmit()}>Submit</Button>
      </List>
      <Block strong className="error">
        <p>{error}</p>
      </Block>
    </Page>
  )
}
export default NewProduct
