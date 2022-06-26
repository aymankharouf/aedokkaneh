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
import { settingsOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
const ProductPacks = () => {
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
    const packs = params.type === 'a' ? stateArchivedPacks.filter(p => p.productId === params.id) : statePacks.filter(p => p.productId === params.id)
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
      <IonContent fullscreen>
        <IonCard>
          <IonRow>
            <IonCol>
              <IonImg src={product.imageUrl} alt={labels.noImage} />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{productOfText(product.trademark || '', country?.name || '')}</IonCol>
            <IonCol className="ion-text-end"><RatingStars rating={product.rating} count={product.ratingCount} /></IonCol>
          </IonRow>
        </IonCard>
        <IonList className="list">
          {packs.map(p => 
            <IonItem key={p.id} routerLink={`/pack-details/${p.id}`}>
              <IonLabel>{p.name}</IonLabel>
              {p.closeExpired && <IonBadge slot="end" color="danger">{labels.closeExpired}</IonBadge>}
              {!p.isOffer && !p.offerEnd && p.price > 0 && <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)}</IonLabel>}
              {(p.isOffer || p.offerEnd) && <IonBadge slot="end" color="success">{p.price > 0 ? (p.price / 100).toFixed(2) : labels.offer}</IonBadge>}
            </IonItem>
          )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={settingsOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.details,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/product-details/${params.id}`)
          },
          {
            text: labels.addPack,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/add-pack/${params.id}`)
          },
          {
            text: labels.addOffer,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/add-offer/${params.id}`)
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

export default ProductPacks
