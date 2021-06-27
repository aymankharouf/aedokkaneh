import { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const ProductDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [product, setProduct] = useState(() => state.products.find(p => p.id === props.id)!)
  useEffect(() => {
    setProduct(() => state.products.find(p => p.id === props.id)!)
  }, [state.products, props.id])
  return (
    <Page>
      <Navbar title={labels.productDetails} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          type="text" 
          value={product.name}
          readonly
        />
        <ListInput 
          name="alias" 
          label={labels.alias}
          type="text" 
          value={product.alias}
          readonly
        />
        <ListInput 
          name="description" 
          label={labels.description}
          type="text" 
          value={product.description}
          readonly
        />
        <ListInput 
          name="categoryId" 
          label={labels.category}
          type="text" 
          value={state.categories.find(c => c.id === product.categoryId)?.name}
          readonly
        />
        <ListInput 
          name="trademark" 
          label={labels.trademark}
          type="text" 
          value={product.trademark}
          readonly
        />
        <ListInput 
          name="country" 
          label={labels.country}
          type="text" 
          value={product.country}
          readonly
        />
        <img src={product.imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-product/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
    </Page>
  )
}
export default ProductDetails
