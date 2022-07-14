import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { IonToggle, IonList, IonItem, IonContent, IonFab, IonFabButton, IonLabel, IonIcon, IonInput, IonPage, IonActionSheet } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useParams } from 'react-router'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'
import { State, Store } from '../data/types'
import { colors } from '../data/config'

type Params = {
  id: string
}
const StoreInfo = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const [actionOpened, setActionOpened] = useState(false)
  const history = useHistory()
  let i = 0
  return (
    <IonPage>
      <Header title={labels.storeDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={store.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={store.mobile} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel color="primary">{labels.isActive}</IonLabel>
            <IonToggle checked={store.isActive} disabled />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.openTime}
            </IonLabel>
            <IonInput 
              value={store.openTime} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.address}
            </IonLabel>
            <IonInput 
              value={store.address} 
              readonly
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.products,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/store-pack-list/${params.id}`)
          },
          {
            text: labels.edit,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/store-edit/${params.id}`)
          },
          {
            text: labels.trans,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/store-trans-list/${params.id}`)
          },

        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default StoreInfo
