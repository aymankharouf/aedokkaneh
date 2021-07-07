import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import labels from '../data/labels'
import { changeStorePackStatus, getMessage } from '../data/actions'
import { Pack, PackPrice } from '../data/types'
import { IonBadge, IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { colors } from '../data/config'

type ExtendedPackPrice = PackPrice & {
  packInfo: Pack,
  storeName: string
}
const Offers = () => {
  const { state } = useContext(StateContext)
  const [offers, setOffers] = useState<ExtendedPackPrice[]>([])
  const [message] = useIonToast()
  const location = useLocation()
  const [alert] = useIonAlert()
  useEffect(() => {
    setOffers(() => {
      const offers = state.packPrices.filter(p => p.offerEnd)
      const result = offers.map(o => {
        const packInfo = state.packs.find(p => p.id === o.packId)!
        const storeName = o.storeId ? (o.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === o.storeId)?.name || '') : ''
        return {
          ...o,
          packInfo,
          storeName
        }
      })
      return result.sort((o1, o2) => (o1.offerEnd || new Date()) > (o2.offerEnd || new Date()) ? 1 : -1)
    })
  }, [state.packPrices, state.packs, state.stores])
  const handleHaltOffer = (storePack: ExtendedPackPrice) => {
    try{
      const offerEndDate = storePack.offerEnd?.setHours(0, 0, 0, 0)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate && offerEndDate > today) {
        alert({
          header: labels.confirmationTitle,
          message: labels.confirmationText,
          buttons: [
            {text: labels.cancel},
            {text: labels.yes, handler: () => {
              try{
                changeStorePackStatus(storePack, state.packPrices, state.packs)
                message(labels.haltSuccess, 3000)
              } catch(err) {
                message(getMessage(location.pathname, err), 3000)
              }    
            }},
          ],
        })
      } else {
        changeStorePackStatus(storePack, state.packPrices, state.packs)
        message(labels.haltSuccess, 3000)
      }
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.offers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {offers.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>  
          : offers.map(p => 
              <IonItem key={i++}>
                <IonThumbnail slot="start">
                  <img src={p.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.storeName}: ${p.storeName}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{}</IonText>
                  <IonText style={{color: colors[6].name}}>{moment(p.offerEnd).format('Y/M/D')}</IonText>
                </IonLabel>
                {!p.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}
                {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
                {p.isActive &&
                  <IonButton 
                    slot="end" 
                    color="success"
                    onClick={() => handleHaltOffer(p)}
                  >
                    {labels.haltOffer}
                  </IonButton>
                }
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Offers