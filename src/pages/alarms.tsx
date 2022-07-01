import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { alarmTypes, colors } from '../data/config'
import { Alarm, Customer, Pack, State } from '../data/types'
import { IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

const Alarms = () => {
  const stateAlarms = useSelector<State, Alarm[]>(state => state.alarms)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCustomers = useSelector<State, Customer[]>(state => state.customers)
  const alarms = useMemo(() => stateAlarms.filter(a => a.status === 'n')
                                          .map(a => {
                                            const pack = statePacks.find(p => p.id === a.packId)!
                                            const customer = stateCustomers.find(c => c.id === a.userId)!
                                            return {
                                              ...a,
                                              customer,
                                              pack,
                                            }
                                          })
                                          .sort((a1, a2) => a1.time > a2.time ? 1 : -1)
  , [stateAlarms, statePacks, stateCustomers])
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
              <IonItem key={a.id} routerLink={`/alarm-details/${a.id}/user/${a.customer.id}`}>
                <IonThumbnail slot="start">
                  <IonImg src={a.pack.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{alarmTypes.find(t => t.id === a.type)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{a.customer.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${a.pack.product.name} ${a.pack.name}`}</IonText>
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
