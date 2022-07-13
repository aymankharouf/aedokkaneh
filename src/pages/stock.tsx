import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { Pack, State, Stock as StockType } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import firebase from '../data/firebase'

const Stock = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStocks = useSelector<State, StockType[]>(state => state.stocks)
  const stockPacks = useMemo(() => stateStocks.filter(s => s.quantity > 0)
                                              .map(p => {
                                                  const pack = statePacks.find(pa => pa.id === p.id)!
                                                  return {
                                                    ...p,
                                                    pack
                                                  }
                                                })                                  
  , [stateStocks, statePacks])

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
              <IonItem key={i++} routerLink={`/stock-trans-list/${p.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{quantityText(p.quantity, p.weight)}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Stock
