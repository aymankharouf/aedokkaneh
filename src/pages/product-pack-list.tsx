import { useState, useMemo } from 'react'
import RatingStars from './rating-stars'
import labels from '../data/labels'
import { archiveProduct, deleteProduct, getMessage, productOfText } from '../data/actions'
import { Country, Err, Pack, Product, State } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
const ProductPackList = () => {
  const params = useParams<Params>()
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const stateArchivedProducts = useSelector<State, Product[]>(state => state.archivedProducts)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateArchivedPacks = useSelector<State, Pack[]>(state => state.archivedPacks)
  const product = useMemo(() => params.type === 'a' ? stateArchivedProducts.find(p => p.id === params.id)! : stateProducts.find(p => p.id === params.id)!, [stateArchivedProducts, stateProducts, params.id, params.type])
  const country = useMemo(() => stateCountries.find(c => c.id === product.countryId), [stateCountries, product])
  const [actionOpened, setActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const packs = useMemo(() => {
    const packs = params.type === 'a' ? stateArchivedPacks.filter(p => p.product.id === params.id) : statePacks.filter(p => p.product.id === params.id)
    return packs.sort((p1, p2) => p2.price - p1.price)
  }, [statePacks, stateArchivedPacks, params.id, params.type])
  const activePacks = useMemo(() => packs.filter(p => p.price > 0), [packs])
  const handleArchive = () => {
    try{
      archiveProduct(product, statePacks)
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteProduct(product)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={`${product.name}${product.alias ? '-' + product.alias : ''}`} />
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonRow>
            <IonCol>
              <IonImg src={product.imageUrl || '/no-image.webp'} alt={labels.noImage} style={{margin: 'auto'}}/>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{productOfText(product.trademark || '', country?.name || '')}</IonCol>
            <IonCol className="ion-text-end"><RatingStars rating={product.rating} count={product.ratingCount} /></IonCol>
          </IonRow>
        </IonCard>
        <IonList className="list">
          {packs.map(p => 
            <IonItem key={p.id} routerLink={`/pack-store-list/${p.id}`}>
              <IonLabel>{p.name}</IonLabel>
              {p.price > 0 && <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)} {p.isOffer && <IonBadge slot="end">{labels.offer}</IonBadge>}</IonLabel>}
            </IonItem>
          )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.details,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/product-edit/${params.id}`)
          },
          {
            text: labels.addPack,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/pack-add/${params.id}`)
          },
          {
            text: labels.archive,
            cssClass: activePacks.length === 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleArchive()
          },
          {
            text: labels.delete,
            cssClass: packs.length === 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDelete()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default ProductPackList
