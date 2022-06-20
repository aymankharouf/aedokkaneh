import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import { addOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { State, Trademark } from '../data/types'

const Trademarks = () => {
  const stateTrademarks = useSelector<State, Trademark[]>(state => state.trademarks)
  const [trademarks, setTrademarks] = useState(() => [...stateTrademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    setTrademarks(() => [...stateTrademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  }, [stateTrademarks])

  return (
    <IonPage>
      <Header title={labels.trademarks} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {trademarks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : trademarks.map(t =>
              <IonItem key={t.id} routerLink={`/edit-trademark/${t.id}`}>
                <IonLabel>{t.name}</IonLabel>
              </IonItem>  
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-trademark">
          <IonIcon ios={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}

export default Trademarks
