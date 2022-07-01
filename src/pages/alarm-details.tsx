import { useState, useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { approveAlarm, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes, colors } from '../data/config'
import { Alarm, Customer, Err, Pack, PackPrice, State, Store } from '../data/types'
import { IonList, IonItem, IonContent, IonFab, IonFabButton, IonLabel, IonIcon, IonInput, IonPage, useIonToast, IonSelect, IonSelectOption, IonListHeader, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  userId: string
}

const AlarmDetails = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const stateAlarms = useSelector<State, Alarm[]>(state => state.alarms)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const [newPackId, setNewPackId] = useState('')
  const customer = useMemo(() => stateCustomers.find(u => u.id === params.userId)!, [stateCustomers, params.userId])
  const alarm = useMemo(() => stateAlarms.find(a => a.id === params.id)!, [stateAlarms, params.id])
  const pack = useMemo(() => statePacks.find(p => p.id === alarm.packId)!, [statePacks, alarm])
  const storeName = useMemo(() => stateStores.find(s => s.id === customer.storeId)?.name, [stateStores, customer])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const packs = useMemo(() => {
    const packs = statePacks.filter(p => p.id !== pack.id)
    let result: Pack[] = []
    if (alarm.type === 'go') {
      result = packs.filter(p => p.product.id === pack.product.id && p.isOffer)
    } else if (alarm.type === 'eo') {
      result = packs.filter(p => p.product.id === pack.product.id && p.isOffer)
    }
    return result.map(p => {
      return {
        id: p.id,
        name: `${p.product.name} ${p.name}`
      }
    })
    .sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [statePacks, pack, alarm])
  const prices = useMemo(() => statePackPrices.filter(p => p.storeId !== customer.storeId && p.packId === (newPackId || pack.id))
                                              .map(p => {
                                                const storeInfo = stateStores.find(s => s.id === p.storeId)!
                                                return {
                                                  ...p,
                                                  storeInfo
                                                }
                                              })
                                              .sort((p1, p2) => p1.price - p2.price)
  , [statePackPrices, stateStores, customer, pack, newPackId])
  const handleApprove = () => {
    try{
      approveAlarm(alarm, stateAlarms, newPackId, customer, statePackPrices, statePacks)
      message(labels.approveSuccess, 3000)
			history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return (
    <IonPage>
      <Header title={alarmTypes.find(t => t.id === alarm.type)?.name} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.name}
            </IonLabel>
            <IonInput 
              value={customer.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.product}
            </IonLabel>
            <IonInput 
              value={pack.product.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.pack}
            </IonLabel>
            <IonInput 
              value={pack.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.currentPrice}
            </IonLabel>
            <IonInput 
              value={(pack.price / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          {alarm.type === 'aa' &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.alternative}
              </IonLabel>
              <IonInput 
                value={alarm.alternative} 
                readonly
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.price}
            </IonLabel>
            <IonInput 
              value={(alarm.price / 100).toFixed(2)} 
              readonly
            />
          </IonItem>
          {['eo', 'go'].includes(alarm.type) &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.quantity}
              </IonLabel>
              <IonInput 
                value={alarm.quantity} 
                readonly
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.offerDays}
            </IonLabel>
            <IonInput 
              value={alarm.offerDays} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.storeName}
            </IonLabel>
            <IonInput 
              value={storeName} 
              readonly
            />
          </IonItem>
          {['aa', 'eo', 'go'].includes(alarm.type) &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.newProduct}
              </IonLabel>
              <IonSelect 
                ok-text={labels.ok} 
                cancel-text={labels.cancel} 
                value={newPackId}
                onIonChange={e => setNewPackId(e.detail.value)}
              >
                {packs.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          }
        </IonList>
        <IonListHeader>
          <IonLabel>{labels.prices}</IonLabel>
        </IonListHeader>
          <IonList>
          {prices.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.storeInfo.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.quantity ? `${labels.quantity}: ${p.quantity}` : ''}</IonText>
                <IonText style={{color: colors[2].name}}>{moment(p.time).fromNow()}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)}</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleApprove} color="success">
          <IonIcon ios={checkmarkOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default AlarmDetails
