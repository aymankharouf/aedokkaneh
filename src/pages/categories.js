import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, FabButton, FabButtons, Badge, FabBackdrop } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'
import { deleteCategory, showMessage, showError, getMessage } from '../data/actions'

const Categories = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [currentCategory] = useState(() => state.categories.find(c => c.id === props.id) || '')
  const [categoryChildrenCount] = useState(() => state.categories.filter(c => c.parentId === currentCategory.id).length)
  const [categoryProductsCount] = useState(() => state.products.filter(p => p.categoryId === currentCategory.id).length)
  useEffect(() => {
    setCategories(() => {
      let categories = state.categories.filter(c => c.parentId === props.id)
      categories = categories.map(c => {
        const childrenCount = state.categories.filter(cc => cc.parentId === c.id).length
        const productsCount = state.products.filter(p => p.categoryId === c.id).length
        return {
          ...c,
          childrenCount,
          productsCount
        }
      })
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [state.categories, state.products, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = () => {
    try{
      deleteCategory(currentCategory, state.categories)
      showMessage(labels.deleteSuccess)
      props.f7router.back()
    } catch(err) {
      setError(getMessage(props, err))
    }
  }

  return (
    <Page>
      <Navbar title={currentCategory?.name || labels.categories} backLink={labels.back} />
      <Block>
        <List mediaList>
          {categories.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : categories.map(c =>
              <ListItem 
                link={`/categories/${c.id}`} 
                title={c.name}
                subtitle={`${labels.childrenCount}: ${c.childrenCount} ${c.childrenCount > 0 && c.isLeaf ? 'X' : ''}`}
                text={`${labels.attachedProducts}: ${c.productsCount} ${c.productsCount > 0 && !c.isLeaf ? 'X': ''}`}
                after={c.ordering}
                key={c.id} 
              >
                {c.isActive ? '' : <Badge slot="title" color='red'>{labels.inActive}</Badge>}
              </ListItem>
            )
          }
        </List>
      </Block>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => props.f7router.navigate(`/add-category/${props.id}`)}>
            <Icon material="add"></Icon>
          </FabButton>
          {props.id === '0' ? '' :
            <FabButton color="blue" onClick={() => props.f7router.navigate(`/edit-category/${props.id}`)}>
              <Icon material="edit"></Icon>
            </FabButton>
          }
          {props.id !== '0' && categoryChildrenCount + categoryProductsCount === 0 ?
            <FabButton color="red" onClick={() => handleDelete()}>
              <Icon material="delete"></Icon>
            </FabButton>
          : ''}
          <FabButton color="orange" onClick={() => props.f7router.navigate(`/products/${props.id}`)}>
            <Icon material="shopping_cart"></Icon>
          </FabButton>

        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Categories
