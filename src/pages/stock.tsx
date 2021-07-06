import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Pack, PackPrice } from '../data/types'
import { IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { constructOutline } from 'ionicons/icons'

type ExtendedPackPrice = PackPrice & {
  packInfo: Pack
}
const Stock = () => {
  const { state } = useContext(StateContext)
  const [stockPacks, setStockPacks] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setStockPacks(() => {
      const stockPacks = state.packPrices.filter(p => p.storeId === 's')
      const result = stockPacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
      return result.sort((p1, p2) => p1.time > p2.time ? 1 : -1)
    })
  }, [state.packPrices, state.packs])

  if (!state.user) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
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
                  <img src={p.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.gross}: ${(p.cost * (p.weight || p.quantity)/ 100).toFixed(2)}`}</IonText>
                </IonLabel>
                {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
                <IonLabel slot="end" className="price">{(p.cost / 100).toFixed(2)}</IonLabel>
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
