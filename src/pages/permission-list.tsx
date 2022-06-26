import { useMemo } from 'react'
import labels from '../data/labels'
import { permitUser, getMessage } from '../data/actions'
import { CustomerInfo, Err, State, Store, UserInfo } from '../data/types'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { addOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const PermissionList = () => {
  const params = useParams<Params>()
  const stateCustomers = useSelector<State, CustomerInfo[]>(state => state.customers)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stateUsers = useSelector<State, UserInfo[]>(state => state.users)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [loading, dismiss] = useIonLoading()
  const customers = useMemo(() => stateCustomers.filter(c => (params.id === 's' && c.storeId) || (params.id === 'n' && c.storeName && !c.storeId))
                                                .map(c => {
                                                  const storeName = stateStores.find(s => s.id === c.storeId)?.name || c.storeName
                                                  return {
                                                    ...c,
                                                    storeName
                                                  }
                                                })
  , [stateCustomers, stateStores, params.id])
  const handleUnPermit = (customer: CustomerInfo) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: async () => {
          try{
            loading()
            await permitUser(customer.id, '', stateUsers, stateStores)
            dismiss()
            message(labels.unPermitSuccess, 3000)
            history.goBack()
          } catch (error){
            dismiss()
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }
        }},
      ],
    })
  }
  return(
    <IonPage>
      <Header title={params.id === 's' ? labels.storesOwners : labels.newOwners} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {customers.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : customers.map(c => 
              <IonItem key={c.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{c.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{c.storeName || ''}</IonText>
                </IonLabel>
                {params.id === 'n' ?
                  <IonButton 
                    slot="end" 
                    color="success"
                    fill="clear"
                    routerLink={`/permit-user/${c.id}`}
                  >
                    {labels.permitUser}
                  </IonButton>
                : 
                  <IonButton 
                    slot="end" 
                    color="success"
                    fill="clear"
                    onClick={()=> handleUnPermit(c)}
                  >
                    {labels.unPermitUser}
                  </IonButton>
                }
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/permit-user/0" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default PermissionList
