import { useContext, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { confirmPurchase, stockOut, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonButton, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { trashOutline } from 'ionicons/icons'
import { colors } from '../data/config'


const ConfirmPurchase = () => {
  const { state, dispatch } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === state.basket?.storeId)!)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [basket] = useState(() => state.basket?.packs.map(p => {
    const packInfo = state.packs.find(pa => pa.id === p.packId)!
    return {
      ...p,
      packInfo,
    }
  }))
  const [total] = useState(() => state.basket?.packs.reduce((sum, p) => sum + Math.round(p.cost * (p.weight || p.quantity)), 0) || 0)
  const handlePurchase = () => {
    try{
      if (store.id === 's') {
        stockOut(state.basket?.packs!, state.orders, state.packPrices, state.packs)
        message(labels.purchaseSuccess, 3000)
        history.push('/')
        dispatch({type: 'CLEAR_BASKET'})    
      } else {
        confirmPurchase(state.basket?.packs!, state.orders, store.id!, state.packPrices, state.packs, state.stores, total)
        message(labels.purchaseSuccess, 3000)
        history.push('/')
        dispatch({type: 'CLEAR_BASKET'})    
      }  
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDelete = () => {
    history.push('/')
    dispatch({type: 'CLEAR_BASKET'})  
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${labels.confirmPurchase} ${store.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {basket?.map(p => 
            <IonItem key={i++}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.unitPrice}: ${(p.cost / 100).toFixed(2)}`}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
              </IonLabel>
              {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              <IonLabel slot="end" className="price">{((p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}</IonLabel>
            </IonItem>   
        
          )}
          <IonItem>
            <IonLabel>{labels.total}</IonLabel>
            <IonLabel slot="end" className="price">{(total / 100).toFixed(2)}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>{labels.net}</IonLabel>
            <IonLabel slot="end" className="price">{(total / 100).toFixed(2)}</IonLabel>
          </IonItem>
         </IonList>
      </IonContent>
      <div className="ion-text-center">
        <IonButton 
          fill="solid" 
          shape="round"
          color="secondary"
          style={{width: '10rem'}}
          onClick={handlePurchase}
        >
          {labels.submit}
        </IonButton>
      </div>

      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleDelete} color="danger">
          <IonIcon ios={trashOutline} /> 
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}
export default ConfirmPurchase
