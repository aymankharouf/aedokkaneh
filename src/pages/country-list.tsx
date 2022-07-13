import { useMemo } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { Country, State } from '../data/types'


const CountryList = () => {
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const countries = useMemo(() => stateCountries.sort((c1, c2) => c1.name > c2.name ? 1 : -1), [stateCountries])
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
              <IonItem key={c.id} routerLink={`/country-edit/${c.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c.name}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/country-add" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default CountryList
