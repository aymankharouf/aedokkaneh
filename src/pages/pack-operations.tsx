import { useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { quantityText } from '../data/actions'
import { Pack, Purchase, State, StockPack, Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
type ExtendedStockPack = StockPack & {
  storeInfo: Store,
  id: string,
  time: Date
}
const PackOperations = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePurchases = useSelector<State, Purchase[]>(state => state.purchases)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const [pack] = useState(() => statePacks.find(p => p.id === params.id)!)
  const [packOperations, setPackOperations] = useState<ExtendedStockPack[]>([])
  useEffect(() => {
    setPackOperations(() => {
      const purchases = statePurchases.filter(p => p.basket.find(p => p.packId === pack.id))
      const packOperations = purchases.map(p => {
        const operationPack = p.basket.find(pa => pa.packId === pack.id)!
        const storeInfo = stateStores.find(s => s.id === p.storeId)!
        return {
          ...operationPack,
          id: p.id!,
          time: p.time,
          storeInfo
        }
      })
      return packOperations.sort((t1, t2) => t2.time > t1.time ? 1 : -1)
    })
  }, [statePurchases, stateStores, pack])
  return(
    <IonPage>
      <Header title={`${pack.productName} ${pack.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {packOperations.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packOperations.map(t => 
              <IonItem key={t.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{t.storeInfo.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}</IonText>
                  <IonText style={{color: colors[2].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(t.cost / 100).toFixed(2)}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default PackOperations
