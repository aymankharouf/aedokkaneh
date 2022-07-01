import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Category, Pack, PackPrice, State, Store } from '../data/types'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { addOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const StorePacks = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const storePacks = useMemo(() => statePackPrices.filter(p => p.storeId === params.id)
                                                  .map(p => {
                                                    const packInfo = statePacks.find(pa => pa.id === p.packId)!
                                                    const categoryInfo = stateCategories.find(c => c.id === packInfo.categoryId)!
                                                    return {
                                                      ...p,
                                                      packInfo,
                                                      categoryInfo
                                                    } 
                                                  })
                                                  .sort((p1, p2) => p1.packInfo.categoryId === p2.packInfo.categoryId ? (p2.time > p1.time ? 1 : -1) : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
  , [statePackPrices, statePacks, stateCategories, params.id])
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
                  <IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{p.categoryInfo.name}</IonText>
                  <IonText style={{color: colors[5].name}}>{p.offerEnd ? `${labels.offerUpTo}: ${moment(p.offerEnd).format('Y/M/D')}` : ''}</IonText>
                  <IonText style={{color: colors[6].name}}>{moment(p.time).fromNow()}</IonText>
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
