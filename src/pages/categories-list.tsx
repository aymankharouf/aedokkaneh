import { useMemo } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import { colors } from '../data/config'
import { addOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { Category, State } from '../data/types'


const Categories = () => {
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const categories = useMemo(() => stateCategories.sort((c1, c2) => c1.ordering - c2.ordering), [stateCategories])
  return (
    <IonPage>
      <Header title={labels.categories} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {categories.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : categories.map(c =>
              <IonItem key={c.id} routerLink={`/edit-category/${c.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{stateCategories.find(cc => cc.id === c.parentId)?.name}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/add-category" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Categories
