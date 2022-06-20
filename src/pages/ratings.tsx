import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { approveRating, getMessage } from '../data/actions'
import { Err, Pack, Product, Rating, State, UserInfo } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'

type ExtendedRating = Rating & {
  userInfo: UserInfo,
  productInfo: Product
}
const Ratings = () => {
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const stateProducts = useSelector<State, Product[]>(state => state.products)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const [ratings, setRatings] = useState<ExtendedRating[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  useEffect(() => {
    setRatings(() => {
      const ratings = stateRatings.filter(r => r.status === 'n')
      return ratings.map(r => {
        const userInfo = stateUsers.find(u => u.id === r.userId)!
        const productInfo = stateProducts.find(p => p.id === r.productId)!
        return {
          ...r,
          userInfo,
          productInfo
        }
      })
    })
  }, [stateUsers, stateProducts, stateRatings])
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
                  <img src={r.productInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.productInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${r.userInfo.name}:${r.userInfo.mobile}`}</IonText>
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
