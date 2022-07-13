import { useMemo, useState } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Err, Pack, PackPrice, State, Store, StoreTrans } from '../data/types'
import { useLocation, useParams } from 'react-router'
import { IonActionSheet, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import { approveStoreTrans, deleteStoreTrans, getMessage } from '../data/actions'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import IonAlert from './ion-alert'

type Params = {
  id: string
}
const StoreTransList = () => {
  const params = useParams<Params>()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateStoreTrans = useSelector<State, StoreTrans[]>(state => state.storeTrans)
  const [actionOpened, setActionOpened] = useState(false)
  const [currentStoreTrans, setCurrentStoreTrans] = useState<StoreTrans>()
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
  const handleApprove = async () => {
    try {
      if (!currentStoreTrans) return
      if (await IonAlert(alert, labels.confirmationText)) {
        approveStoreTrans(currentStoreTrans, stateStoreTrans, statePackPrices, statePacks)
        message(labels.approveSuccess, 3000)
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleDelete = async () => {
    try {
      if (!currentStoreTrans) return
      if (await IonAlert(alert, labels.confirmationText)) {
        deleteStoreTrans(currentStoreTrans, stateStoreTrans)
        message(labels.deleteSuccess, 3000)
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }

  const handleActions = (storeTrans: StoreTrans) => {
    setCurrentStoreTrans(storeTrans)
    setActionOpened(true)
  }
  let i = 0
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
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{t.store?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{t.pack?.product.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{t.pack?.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.newPrice}: ${(t.newPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.oldPrice}: ${(t.oldPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{moment(new Date(t.time)).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={ellipsisVerticalOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleActions(t)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.approve,
            cssClass: currentStoreTrans?.status === 'n' ? colors[i++ % 10].name: 'ion-hide',
            handler: () => handleApprove()
          },
          {
            text: labels.delete,
            cssClass: currentStoreTrans?.status === 'n' ? colors[i++ % 10].name: 'ion-hide',
            handler: () => handleDelete()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default StoreTransList
