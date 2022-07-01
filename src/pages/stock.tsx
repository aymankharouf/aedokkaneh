import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Pack, PackPrice, State } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { constructOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import firebase from '../data/firebase'

const Stock = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stockPacks = useMemo(() => statePackPrices.filter(p => p.storeId === 's')
                                                  .map(p => {
                                                    const packInfo = statePacks.find(pa => pa.id === p.packId)!
                                                    return {
                                                      ...p,
                                                      packInfo
                                                    }
                                                  })
                                                  .sort((p1, p2) => p1.time > p2.time ? 1 : -1)
  , [statePackPrices, statePacks])

  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  let i = 0
  return(
    <IonPage>
      <Header title={labels.stock} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stockPacks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>  
          : stockPacks.map(p => 
              <IonItem key={i++} routerLink={`/stock-pack-operations/${p.packId}`}>
                <IonThumbnail slot="start">
                  <img src={p.packInfo.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.gross}: ${(p.price * (p.weight || p.quantity)/ 100).toFixed(2)}`}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/stock-operations" color="success">
          <IonIcon ios={constructOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Stock
