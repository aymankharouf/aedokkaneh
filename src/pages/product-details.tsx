import { useMemo } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import { useParams } from 'react-router'
import Header from './header'
import { pencilOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Category, Product, State } from '../data/types'

type Params = {
  id: string
}
const ProductDetails = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const product = useMemo(() => stateProducts.find(p => p.id === params.id)!, [stateProducts, params.id])

  return (
    <IonPage>
      <Header title={labels.productDetails} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={product.name} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.alias}
            </IonLabel>
            <IonInput 
              value={product.alias} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.description}
            </IonLabel>
            <IonInput 
              value={product.description} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.category}
            </IonLabel>
            <IonInput 
              value={stateCategories.find(c => c.id === product.categoryId)?.name} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.trademark}
            </IonLabel>
            <IonInput 
              value={product.trademark} 
              type="text"
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.country}
            </IonLabel>
            <IonInput 
              value={product.countryId} 
              type="text"
              readonly
            />
          </IonItem>
          <IonImg src={product.imageUrl} alt={labels.noImage} />
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink={`/edit-product/${params.id}`} color="success">
          <IonIcon ios={pencilOutline} /> 
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}
export default ProductDetails
