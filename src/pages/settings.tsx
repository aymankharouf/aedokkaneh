import { useMemo } from 'react'
import labels from '../data/labels'
import { colors } from '../data/config'
import {IonButton, IonContent, IonPage} from '@ionic/react'
import Header from './header'
import Footer from './footer'

const Settings = () => {
  const sections = useMemo(() => [
    {id: '1', name: labels.countries, path: '/country-list'},
    {id: '2', name: labels.categories, path: '/category-list/0'},
    {id: '3', name: labels.regions, path: '/region-list'},
    {id: '4', name: labels.adverts, path: '/advert-list'}
  ], [])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.settings} />
      <IonContent fullscreen className="ion-padding">
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={s.id}
          >
            {s.name}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Settings
