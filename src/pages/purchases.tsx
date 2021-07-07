import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { Purchase, Store } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { cloudUploadOutline } from 'ionicons/icons'

type ExtendedPurchase = Purchase & {
  storeInfo: Store
}
const Purchases = () => {
  const { state } = useContext(StateContext)
  const [purchases, setPurchases] = useState<ExtendedPurchase[]>([])
  useEffect(() => {
    setPurchases(() => {
      const purchases = state.purchases.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return purchases.sort((p1, p2) => p2.time > p1.time ? 1 : -1)
    })
  }, [state.purchases, state.stores])

  if (!state.user) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
 			<Header title={labels.purchases} />
      <IonContent fullscreen>
        <IonList>
          {purchases.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : purchases.map(p => 
              <IonItem key={p.id} routerLink={`/purchase-details/${p.id}/n`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.storeInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(p.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(p.total / 100).toFixed(2)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/archived-purchases" color="success">
          <IonIcon ios={cloudUploadOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Purchases
