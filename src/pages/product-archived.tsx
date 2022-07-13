import { useMemo } from 'react'
import labels from '../data/labels'
import { getArchivedProducts, getArchivedPacks, getMessage } from '../data/actions'
import { Category, Err, Product, State } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { repeatOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'

const ProductArchived = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateArchivedProducts = useSelector<State, Product[]>(state => state.archivedProducts)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const location = useLocation()
  const [message] = useIonToast()
  const [loading, dismiss] = useIonLoading()
  const products = useMemo(() => stateArchivedProducts.map(p => {
                                                        const categoryInfo = stateCategories.find(c => c.id === p.categoryId)!
                                                        return {
                                                          ...p,
                                                          categoryInfo
                                                        }
                                                      })
                                                      .sort((p1, p2) => p1.sales - p2.sales)
  , [stateArchivedProducts, stateCategories])
  const handleRetreive = async () => {
    try{
      loading()
      const products = await getArchivedProducts()
      if (products.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PRODUCTS', payload: products})
      }
      const packs = await getArchivedPacks()
      if (packs.length > 0) {
        dispatch({type: 'SET_ARCHIVED_PACKS', payload: packs})
      }
      dismiss()
    } catch(error) {
      dismiss()
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={labels.archivedProducts} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {products.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : products.map(p => 
              <IonItem key={p.id} routerLink={`/product-pack-list/${p.id}/a`}>
                <IonThumbnail slot="start">
                  <img src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.categoryInfo.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${labels.productOf} ${p.trademark ? labels.company + ' ' + p.trademark + '-' : ''}${p.countryId}`}</IonText>
                </IonLabel>
              </IonItem>   
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleRetreive} color="success">
          <IonIcon ios={repeatOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default ProductArchived