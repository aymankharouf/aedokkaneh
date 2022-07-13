import { useEffect, useMemo, useState } from 'react'
import labels from '../data/labels'
import { productOfText } from '../data/actions'
import { Category, Country, Pack, Product, State } from '../data/types'
import { useHistory, useParams } from 'react-router'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import Fuse from "fuse.js"
import { colors } from '../data/config'
import { chevronUpOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'
type Params = {
  id: string
}
const ProductList = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateSearchText = useSelector<State, string>(state => state.searchText)
  const [actionOpened, setActionOpened] = useState(false)
  const history = useHistory()
  const category = useMemo(() => stateCategories.find(c => c.id === params.id), [stateCategories, params.id])
  useEffect(() => {
    return function cleanUp() {
      dispatch({ type: 'CLEAR_SEARCH' })
    }
  }, [dispatch])
  const products = useMemo(() => stateProducts.filter(p => params.id === '-1' ? !statePacks.find(pa => pa.product.id === p.id) || statePacks.filter(pa => pa.product.id === p.id).length === statePacks.filter(pa => pa.product.id === p.id && pa.price === 0).length : params.id === '0' || p.categoryId === params.id)
    .map(p => {
      const category = stateCategories.find(c => c.id === p.categoryId)!
      const country = stateCountries.find(c => c.id === p.countryId)
      return {
        ...p,
        categoryName: category.name,
        countryName: country?.name || ''
      }
    })
    .sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryName > p2.categoryName ? 1 : -1))
    , [stateProducts, stateCategories, statePacks, stateCountries, params.id])
  const data = useMemo(() => {
    if (!stateSearchText) {
      return products
    }
    const options = {
      includeScore: true,
      findAllMatches: true,
      threshold: 0.1,
      keys: ['name', 'alias', 'description', 'categoryName', 'trademark', 'countryName']
    }
    const fuse = new Fuse(products, options)
    const result = fuse.search(stateSearchText)
    return result.map(p => p.item)
  }, [stateSearchText, products])
  let i = 0
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return (
    <IonPage>
      <Header title={params.id === '-1' ? labels.notUsedProducts : (params.id === '0' ? labels.products : category?.name || '')} withSearch />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {data.length === 0 ?
            <IonItem>
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
            : data.map(p =>
              <IonItem key={p.id} routerLink={`/product-pack-list/${p.id}/n`}>
                <IonLabel>
                  <IonText style={{ color: colors[0].name }}>{p.name}</IonText>
                  <IonText style={{ color: colors[1].name }}>{p.alias}</IonText>
                  <IonText style={{ color: colors[2].name }}>{p.description}</IonText>
                  <IonText style={{ color: colors[3].name }}>{p.categoryName}</IonText>
                  <IonText style={{ color: colors[4].name }}>{productOfText(p.trademark, p.countryName)}</IonText>
                </IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab horizontal="center" vertical="bottom" slot="fixed">
        <IonFabButton size="small" onClick={() => setActionOpened(true)}>
          <IonIcon ios={chevronUpOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.add,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/product-add/${params.id}`)
          },
          {
            text: labels.archivedProducts,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push("/product-archived")
          },
          {
            text: labels.notUsedProducts,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push("/product-list/-1")
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default ProductList