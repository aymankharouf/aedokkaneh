import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { permitUser, getMessage } from '../data/actions'
import { CustomerInfo, Err } from '../data/types'
import { IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { addOutline } from 'ionicons/icons'
import { colors } from '../data/config'

type Params = {
  id: string
}
const PermissionList = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [customers, setCustomers] = useState<CustomerInfo[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const [loading, dismiss] = useIonLoading()
  useEffect(() => {
    setCustomers(() => {
      const customers = state.customers.filter(c => (params.id === 's' && c.storeId) || (params.id === 'n' && c.storeName && !c.storeId))
      return customers.map(c => {
        const storeName = state.stores.find(s => s.id === c.storeId)?.name || c.storeName
        return {
          ...c,
          storeName
        }
      })
    })
  }, [state.customers, state.stores, state.users, params.id])
  const handleUnPermit = (customer: CustomerInfo) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: async () => {
          try{
            loading()
            await permitUser(customer.id, '', state.users, state.stores)
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
