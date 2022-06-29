import { useMemo } from 'react'
import labels from '../data/labels'
import { approveRating, getMessage } from '../data/actions'
import { Customer, Err, Pack, Product, Rating, State } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'

type ExtendedRating = Rating & {
  customer: Customer,
  product: Product
}
const Ratings = () => {
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [message] = useIonToast()
  const location = useLocation()
  const ratings = useMemo(() => stateRatings.filter(r => r.status === 'n')
                                            .map(r => {
                                              const customer = stateCustomers.find(c => c.id === r.userId)!
                                              const product = stateProducts.find(p => p.id === r.productId)!
                                              return {
                                                ...r,
                                                customer,
                                                product
                                              }
                                            })
  , [stateCustomers, stateProducts, stateRatings])
  const handleApprove = (rating: ExtendedRating) => {
    try{
      approveRating(rating, stateRatings, stateProducts, statePacks)
      message(labels.approveSuccess, 3000)
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.ratings} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {ratings.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : ratings.map(r => 
              <IonItem key={i++}>
                <IonThumbnail slot="start">
                  <img src={r.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${r.customer.name}:${r.customer.mobile}`}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={checkmarkOutline} 
                  slot="end" 
                  color="success"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleApprove(r)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Ratings
