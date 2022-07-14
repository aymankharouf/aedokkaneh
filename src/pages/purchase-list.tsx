import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Purchase, State, Store } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { cloudUploadOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import firebase from '../data/firebase'

const PurchaseList = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const purchases = useMemo(() => statePurchases.map(p => {
                                                  const storeInfo = stateStores.find(s => s.id === p.storeId)!
                                                  return {
                                                    ...p,
                                                    storeInfo
                                                  }
                                                })
                                                .sort((p1, p2) => p2.time > p1.time ? 1 : -1)
  , [statePurchases, stateStores])

  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
 			<Header title={labels.purchases} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {purchases.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : purchases.map(p => 
              <IonItem key={p.id} routerLink={`/purchase-info/${p.id}/n`}>
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
        <IonFabButton routerLink="/purchase-archived" color="success">
          <IonIcon ios={cloudUploadOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default PurchaseList
