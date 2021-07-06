import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { alarmTypes, colors } from '../data/config'
import { Alarm, CustomerInfo, Pack, UserInfo } from '../data/types'
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'

type ExtendedAlarm = Alarm & {
  userInfo: UserInfo,
  packInfo: Pack,
  customerInfo: CustomerInfo
}
const Alarms = () => {
  const { state } = useContext(StateContext)
  const [alarms, setAlarms] = useState<ExtendedAlarm[]>([])
  useEffect(() => {
    setAlarms(() => {
      const alarms = state.alarms.filter(a => a.status === 'n')
      const result = alarms.map(a => {
        const userInfo = state.users.find(u => u.id === a.userId)!
        const packInfo = state.packs.find(p => p.id === a.packId)!
        const customerInfo = state.customers.find(c => c.id === a.userId)!
        return {
          ...a,
          userInfo,
          customerInfo,
          packInfo,
        }
      })
      return result.sort((a1, a2) => a1.time > a2.time ? 1 : -1)
    })
  }, [state.alarms, state.packs, state.users, state.customers])
  return(
    <IonPage>
      <Header title={labels.alarms} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {alarms.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : alarms.map(a => 
              <IonItem key={a.id} routerLink={`/alarm-details/${a.id}/user/${a.userInfo.id}`}>
                <IonThumbnail slot="start">
                  <IonImg src={a.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{alarmTypes.find(t => t.id === a.type)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{a.customerInfo.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${a.packInfo.productName} ${a.packInfo.name}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{moment(a.time).fromNow()}</IonText>
                </IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Alarms
