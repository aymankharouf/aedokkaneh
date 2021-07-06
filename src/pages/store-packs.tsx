import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Category, Pack, PackPrice } from '../data/types'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { addOutline } from 'ionicons/icons'
import { colors } from '../data/config'

type Params = {
  id: string
}
type ExtendedPackPrice = PackPrice & {
  packInfo: Pack,
  categoryInfo: Category
}
const StorePacks = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [storePacks, setStorePacks] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setStorePacks(() => {
      const storePacks = state.packPrices.filter(p => p.storeId === params.id && !p.isAuto)
      const result = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        const categoryInfo = state.categories.find(c => c.id === packInfo.categoryId)!
        return {
          ...p,
          packInfo,
          categoryInfo
        } 
      })
      return result.sort((p1, p2) => p1.packInfo.categoryId === p2.packInfo.categoryId ? (p2.time > p1.time ? 1 : -1) : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
    })
  }, [state.packPrices, state.packs, state.categories, params.id])
  let i = 0
  return(
    <IonPage>
      <Header title={store.name} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {storePacks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : storePacks.map(p => 
              <IonItem key={i++} routerLink={`/pack-details/${p.packId}`}>
                <IonThumbnail slot="start">
                  <img src={p.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.cost}: ${(p.cost / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{p.categoryInfo.name}</IonText>
                  <IonText style={{color: colors[4].name}}>{p.offerEnd ? `${labels.offerUpTo}: ${moment(p.offerEnd).format('Y/M/D')}` : ''}</IonText>
                  <IonText style={{color: colors[4].name}}>{moment(p.time).fromNow()}</IonText>
                </IonLabel>
                {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
                {p.packInfo.isOffer && <IonBadge color="success">{labels.offer}</IonBadge>}
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      {store.id !== 's' &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/add-store-pack/${params.id}`} color="success">
            <IonIcon ios={addOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}

export default StorePacks
