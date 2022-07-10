import { useMemo } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { Region, State } from '../data/types'


const Regions = () => {
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const regions = useMemo(() => stateRegions.sort((l1, l2) => l1.ordering - l2.ordering), [stateRegions])
  return (
    <IonPage>
      <Header title={labels.regions} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {regions.length === 0 ? 
             <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : regions.map(r =>
              <IonItem key={r.id} routerLink={`/edit-region/${r.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{r.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{(r.fees / 100).toFixed(2)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-region" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Regions
