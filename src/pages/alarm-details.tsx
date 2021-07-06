import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import { approveAlarm, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes, colors } from '../data/config'
import { Pack, PackPrice, Store } from '../data/types'
import { IonList, IonItem, IonContent, IonFab, IonFabButton, IonLabel, IonIcon, IonInput, IonPage, useIonToast, IonSelect, IonSelectOption, IonListHeader, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { checkmarkOutline } from 'ionicons/icons'

type Params = {
  id: string,
  userId: string
}
type ExtendedPackPrice = PackPrice & {
  storeInfo: Store
}
const AlarmDetails = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [newPackId, setNewPackId] = useState('')
  const [customerInfo] = useState(() => state.customers.find(c => c.id === params.userId)!)
  const [alarm] = useState(() => state.alarms.find(a => a.id === params.id)!)
  const [pack] = useState(() => state.packs.find(p => p.id === alarm.packId)!)
  const [storeName] = useState(() => state.stores.find(s => s.id === customerInfo.storeId)?.name)
  const [prices, setPrices] = useState<ExtendedPackPrice[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [packs] = useState(() => {
    const packs = state.packs.filter(p => p.id !== pack.id)
    let result: Pack[] = []
    if (alarm.type === 'go') {
      result = packs.filter(p => p.productId === pack.productId && p.isOffer)
    } else if (alarm.type === 'eo') {
      result = packs.filter(p => p.productId === pack.productId && p.isOffer && p.closeExpired)
    }
    const output = result.map(p => {
      return {
        id: p.id,
        name: `${p.productName} ${p.name}`
      }
    })
    return output.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  })
  useEffect(() => {
    setPrices(() => {
      const prices = state.packPrices.filter(p => p.storeId !== customerInfo.storeId && p.packId === (newPackId || pack.id))
      const result = prices.map(p => {
        const storeInfo = state.stores.find(s => s.id === p.storeId)!
        return {
          ...p,
          storeInfo
        }
      })
      return result.sort((p1, p2) => p1.price - p2.price)
    })
  }, [state.packPrices, state.stores, customerInfo, pack, newPackId])
  const handleApprove = () => {
    try{
      approveAlarm(alarm, state.alarms, newPackId, customerInfo, state.packPrices, state.packs)
      message(labels.approveSuccess, 3000)
			history.goBack()
    } catch(err) {
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
              value={customerInfo.name} 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.product}
            </IonLabel>
            <IonInput 
              value={pack.productName} 
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
