import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { productOfText, getCategoryName } from '../data/actions'
import { Category, Country, Pack, Product, State, Trademark } from '../data/types'
import { useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import Fuse from "fuse.js"
import { colors } from '../data/config'
import { addOutline, chevronDownOutline, cloudDownloadOutline, trashBinOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'

type Params = {
  id: string
}
type ExtendedProduct = Product & {
  categoryName: string,
  trademarkName: string,
  countryName: string
}
const Products = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateTrademarks = useSelector<State, Trademark[]>(state => state.trademarks)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateSearchText = useSelector<State, string>(state => state.searchText)
  const [category] = useState(() => stateCategories.find(c => c.id === params.id))
  const [products, setProducts] = useState<ExtendedProduct[]>([])
  const [data, setData] = useState<ExtendedProduct[]>([])
  useEffect(() => {
    return function cleanUp() {
      dispatch({type: 'CLEAR_SEARCH'})
    }
  }, [dispatch])
  useEffect(() => {
    setProducts(() => {
      const products = stateProducts.filter(p => params.id === '-1' ? !statePacks.find(pa => pa.productId === p.id) || statePacks.filter(pa => pa.productId === p.id).length === statePacks.filter(pa => pa.productId === p.id && pa.price === 0).length : params.id === '0' || p.categoryId === params.id)
      const result = products.map(p => {
        const categoryInfo = stateCategories.find(c => c.id === p.categoryId)!
        const trademarkInfo = stateTrademarks.find(t => t.id === p.trademarkId)
        const countryInfo = stateCountries.find(c => c.id === p.countryId)!
        return {
          ...p,
          categoryName: getCategoryName(categoryInfo, stateCategories),
          trademarkName: trademarkInfo?.name || '',
          countryName: countryInfo.name
        }
      })
      return result.sort((p1, p2) => p1.categoryId === p2.categoryId ? (p1.name > p2.name ? 1 : -1) : (p1.categoryName > p2.categoryName ? 1 : -1))
    })
  }, [stateProducts, stateCategories, statePacks, stateTrademarks, stateCountries, params.id])
  useEffect(() => {
    if (!stateSearchText) {
      setData(products)
      return
    }
    const options = {
      includeScore: true,
      findAllMatches: true,
      threshold: 0.1,
      keys: ['name', 'alias', 'description', 'categoryName', 'trademarkName', 'countryName']
    }
    const fuse = new Fuse(products, options)
    const result = fuse.search(stateSearchText)
    setData(result.map(p => p.item))
  }, [stateSearchText, products])
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={params.id === '-1' ? labels.notUsedProducts : (params.id === '0' ? labels.products : category?.name || '')} withSearch/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {data.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : data.map(p => 
              <IonItem key={p.id} routerLink={`/product-packs/${p.id}/n`}>
                <IonThumbnail slot="start">
                  <img src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.description}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.categoryName}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.trademarkName, p.countryName)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      <IonFab horizontal="end" vertical="top" slot="fixed">
        <IonFabButton size="small" >
          <IonIcon ios={chevronDownOutline} />
        </IonFabButton>
        <IonFabList>
          <IonFabButton color="success" routerLink={`/add-product/${params.id}`}>
            <IonIcon ios={addOutline} />
          </IonFabButton>
          <IonFabButton color="secondary" routerLink="/archived-products">
            <IonIcon ios={cloudDownloadOutline} />
          </IonFabButton>
          <IonFabButton color="danger" routerLink="/products/-1">
            <IonIcon ios={trashBinOutline} />
          </IonFabButton>
        </IonFabList>
      </IonFab>
          </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Products