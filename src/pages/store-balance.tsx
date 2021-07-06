import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { Balance } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'

type Params = {
  id: string
}
const StoreBalance = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [store, setStore] = useState(() => state.stores.find(s => s.id === params.id)!)
  const [balances, setBalances] = useState<Balance[]>([])
  useEffect(() => {
    setStore(() => state.stores.find(s => s.id === params.id)!)
  }, [state.stores, params.id])
  useEffect(() => {
    setBalances(() => {
      const balances = store.balances?.slice() || []
      return balances.sort((b1, b2) => b2.month - b1.month)
    })
  }, [store])

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
