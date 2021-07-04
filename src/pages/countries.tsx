import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'


const Countries = () => {
  const { state } = useContext(StateContext)
  const [countries, setCountries] = useState(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  useEffect(() => {
    setCountries(() => [...state.countries].sort((c1, c2) => c1 > c2 ? 1 : -1))
  }, [state.countries])
  let i = 0
  return (
    <IonPage>
      <Header title={labels.countries} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {countries.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : countries.map(c =>
              <IonItem key={i++} routerLink={`/edit-country/${c}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-country" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Countries
