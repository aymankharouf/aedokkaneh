import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardFooter, List, ListItem, Badge, Toolbar, Actions, ActionsButton, Fab, Icon } from 'framework7-react'
import RatingStars from './rating-stars'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'
import { archiveProduct, deleteProduct, showMessage, getMessage, showError, productOfText } from '../data/actions'

const ProductPacks = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [product] = useState(() => props.type === 'a' ? state.archivedProducts.find(p => p.id === props.id) : state.products.find(p => p.id === props.id))
  const [packs, setPacks] = useState([])
  const [activePacks, setActivePacks] = useState([])
  const actionsList = useRef('')
  useEffect(() => {
    setPacks(() => {
      const packs = props.type === 'a' ? state.archivedPacks.filter(p => p.productId === props.id) : state.packs.filter(p => p.productId === props.id)
      return packs.sort((p1, p2) => p2.price - p1.price)
    })
  }, [state.packs, state.archivedPacks, props.id, props.type])
  useEffect(() => {
    setActivePacks(() => packs.filter(p => p.price > 0))
  }, [packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleArchive = () => {
    try{
      archiveProduct(product, state.packs)
      showMessage(labels.editSuccess)
      f7.views.current.router.back()
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteProduct(product)
        showMessage(labels.deleteSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }

  return (
    <Page>
      <Navbar title={`${product.name}${product.alias ? '-' + product.alias : ''}`} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={product.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
        <CardFooter>
          <p>{productOfText(product.trademark, product.country)}</p>
          <p><RatingStars rating={product.rating} count={product.ratingCount} /></p> 
        </CardFooter>
      </Card>
      <List mediaList>
        {packs.map(p => 
          <ListItem 
            link={`/pack-details/${p.id}`}
            title={p.name}
            after={p.isOffer || p.offerEnd || p.price === 0 ? '' : (p.price / 100).toFixed(2)} 
            key={p.id} 
          >
            {p.isOffer || p.offerEnd ? <Badge slot="after" color="green">{p.price > 0 ? (p.price / 100).toFixed(2) : labels.offer}</Badge> : ''}
            {p.closeExpired ? <Badge slot="title" color="red">{labels.closeExpired}</Badge> : ''}
          </ListItem>
        )}
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => actionsList.current.open()}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/product-details/${props.id}`)}>{labels.details}</ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-pack/${props.id}`)}>{labels.addPack}</ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-offer/${props.id}`)}>{labels.addOffer}</ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-bulk/${props.id}`)}>{labels.addBulk}</ActionsButton>
        {activePacks.length === 0 ? 
          <ActionsButton onClick={() => handleArchive()}>{labels.archive}</ActionsButton>
        : ''}
        {packs.length === 0 ? 
          <ActionsButton onClick={() => handleDelete()}>{labels.delete}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ProductPacks
