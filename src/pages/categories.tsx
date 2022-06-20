import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { deleteCategory, getMessage } from '../data/actions'
import { Category, Err, Product, State } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { menuOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
type ExtendedCategory = Category & {
  childrenCount: number,
  productsCount: number
}
const Categories = () => {
  const params = useParams<Params>()
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const [categories, setCategories] = useState<ExtendedCategory[]>([])
  const [currentCategory] = useState(() => stateCategories.find(c => c.id === params.id)!)
  const [categoryChildrenCount] = useState(() => stateCategories.filter(c => c.parentId === currentCategory?.id).length)
  const [categoryProductsCount] = useState(() => stateProducts.filter(p => p.categoryId === currentCategory?.id).length)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [actionOpened, setActionOpened] = useState(false);
  useEffect(() => {
    setCategories(() => {
      const categories = stateCategories.filter(c => c.parentId === params.id)
      const result = categories.map(c => {
        const childrenCount = stateCategories.filter(cc => cc.parentId === c.id).length
        const productsCount = stateProducts.filter(p => p.categoryId === c.id).length
        return {
          ...c,
          childrenCount,
          productsCount
        }
      })
      return result.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [stateCategories, stateProducts, params.id])
  const handleDelete = () => {
    try{
      deleteCategory(currentCategory, stateCategories)
      message(labels.deleteSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  let i = 0
  return (
    <IonPage>
      <Header title={currentCategory?.name || labels.categories} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {categories.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : categories.map(c =>
            <IonItem key={c.id} routerLink={`/categories/${c.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.childrenCount}: ${c.childrenCount} ${c.childrenCount > 0 && c.isLeaf ? 'X' : ''}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${labels.attachedProducts}: ${c.productsCount} ${c.productsCount > 0 && !c.isLeaf ? 'X': ''}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.ordering}:${c.ordering}`}</IonText>
                </IonLabel>
                {!c.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={menuOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.addChild,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/add-category/${params.id}`)
          },
          {
            text: labels.products,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/products/${params.id}`)
          },
          {
            text: labels.edit,
            cssClass: params.id !== '0' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/edit-category/${params.id}`)
          },
          {
            text: labels.delete,
            cssClass: params.id !== '0' && categoryChildrenCount + categoryProductsCount === 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDelete()
          },
        ]}
      />

      <Footer />
    </IonPage>
  )
}

export default Categories
