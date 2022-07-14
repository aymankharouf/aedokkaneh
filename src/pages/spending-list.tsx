import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'
import { Spending, State } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { checkmarkOutline } from 'ionicons/icons'
import firebase from '../data/firebase'
import { useSelector } from 'react-redux'

const SpendingList = () => {
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateSpendings = useSelector<State, Spending[]>(state => state.spendings)
  const spendings = useMemo(() => stateSpendings.sort((s1, s2) => s2.time > s1.time ? 1 : -1), [stateSpendings])
  if (!stateUser) return <IonPage><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></IonPage>
  return(
    <IonPage>
      <Header title={labels.spendings} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {spendings.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : spendings.map(s => 
              <IonItem key={s.id} routerLink={`/spending-edit/${s.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{spendingTypes.find(t => t.id === s.type)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(s.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(s.amount / 100).toFixed(2)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/spending-add" color="success">
          <IonIcon ios={checkmarkOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default SpendingList
