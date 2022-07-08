import { useMemo } from 'react'
import labels from '../data/labels'
import { State, Store } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const StoreBalance = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const balances = useMemo(() => store.balances?.slice().sort((b1, b2) => b2.month - b1.month) || [], [store])

  return(
    <IonPage>
      <Header title={`${labels.balanceOperations} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {balances.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>  
          : balances.map(b => 
              <IonItem key={b.month} routerLink={`/store-balance-operations/${params.id}/month/${b.month}`}>
                <IonLabel>{`${Math.trunc(b.month / 100)}-${b.month % 100}`}</IonLabel>
                <IonLabel slot="end" className="price">{(b.balance / 100).toFixed(2)}</IonLabel>
              </IonItem> 
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StoreBalance
