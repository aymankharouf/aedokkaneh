import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Pack, PackPrice, State, Stock as StockType } from '../data/types'
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
  const stateStocks = useSelector<State, StockType[]>(state => state.stocks)
  const stockPacks = useMemo(() => stateStocks.map(p => {
                                                  const pack = statePacks.find(pa => pa.id === p.id)!
                                                  return {
                                                    ...p,
                                                    pack
                                                  }
                                                })                                  
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
              <IonItem key={i++} routerLink={`/stock-pack-operations/${p.id}`}>
                <IonThumbnail slot="start">
                  <img src={p.pack.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
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
