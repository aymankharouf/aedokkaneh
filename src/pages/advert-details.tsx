import { useState } from 'react'
import labels from '../data/labels'
import { IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonPage, IonRow } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { personCircleOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { Advert, State } from '../data/types'

type Params = {
  id: string
}
const AdvertDetails = () => {
  const params = useParams<Params>()
  const stateAdverts = useSelector<State, Advert[]>(state => state.adverts)
  const [advert] = useState(() => stateAdverts.find(a => a.id === params.id)!)
  return (
    <IonPage>
      <Header title={labels.advertDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="card-title">{advert?.title}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {advert?.imageUrl && <IonImg src={advert?.imageUrl} alt={advert?.title} />}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">{advert?.text}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink={`/edit-advert/${params.id}`} color="primary">
          <IonIcon ios={personCircleOutline} />
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default AdvertDetails
