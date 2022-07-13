import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Err, Pack, State, Store, StoreTrans as StoreTransType } from '../data/types'
import { useLocation, useParams } from 'react-router'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import { deleteStoreTrans, getMessage } from '../data/actions'
import { trashOutline } from 'ionicons/icons'

type Params = {
  id: string
}
const StoreTransList = () => {
  const params = useParams<Params>()
  const location = useLocation()
  const [message] = useIonToast()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStoreTrans = useSelector<State, StoreTransType[]>(state => state.storeTrans)
  const trans = useMemo(() => stateStoreTrans.filter(t => params.id === '0' || t.storeId === params.id)
                                              .map(t => {
                                                const store = stateStores.find(s => s.id === t.storeId)
                                                const pack = statePacks.find(p => p.id === t.packId)
                                                return {
                                                  ...t,
                                                  store,
                                                  pack
                                                }
                                              })
                                              .sort((t1, t2) => t2.time > t1.time ? 1 : -1)
  , [stateStoreTrans, stateStores, statePacks, params.id])
  const handleDelete = (transId: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: () => {
          try{
            deleteStoreTrans(transId)
            message(labels.deleteSuccess, 3000)
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }

  return(
    <IonPage>
      <Header title={labels.storeTrans} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {trans.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : trans.map(t => 
              <IonItem key={t.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{t.store?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{t.pack?.product.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{t.pack?.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.newPrice}: ${(t.newPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.oldPrice}: ${(t.oldPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(t.id)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StoreTransList
