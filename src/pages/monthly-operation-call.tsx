import { useState } from 'react'
import labels from '../data/labels'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { checkmarkOutline } from 'ionicons/icons'


const MonthlyOperationCall = () => {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  return (
    <IonPage>
      <Header title={labels.monthlyOperations} />
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.month}
            </IonLabel>
            <IonInput 
              value={month} 
              type="number" 
              autofocus
              clearInput
              onIonChange={e => setMonth(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.year}
            </IonLabel>
            <IonInput 
              value={year} 
              type="number" 
              autofocus
              clearInput
              onIonChange={e => setYear(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {month && year &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/monthly-operation-list/${+year * 100 + Number(month)}`} color="success">
            <IonIcon ios={checkmarkOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <Footer />
    </IonPage>
  )
}
export default MonthlyOperationCall
