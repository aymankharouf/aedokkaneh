import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { Category, Err, Pack, PackPrice, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { addOutline, ellipsisVerticalOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import moment from 'moment'
import 'moment/locale/ar'
import { editPrice, getMessage } from '../data/actions'
import IonAlert from './ion-alert'

type Params = {
  id: string
}
const StorePackList = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const [currentStorePack, setCurrentStorePack] = useState<PackPrice>()
  const [actionOpened, setActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const store = useMemo(() => stateStores.find(s => s.id === params.id)!, [stateStores, params.id])
  const storePacks = useMemo(() => statePackPrices.filter(p => p.storeId === params.id)
                                                  .map(p => {
                                                    const pack = statePacks.find(pa => pa.id === p.packId)!
                                                    const category = stateCategories.find(c => c.id === pack.product.categoryId)!
                                                    return {
                                                      ...p,
                                                      pack,
                                                      category
                                                    } 
                                                  })
                                                  .sort((p1, p2) => (p1.lastUpdate > p2.lastUpdate ? 1 : -1))
  , [statePackPrices, statePacks, stateCategories, params.id])
  const handleActions = (storePack: PackPrice) => {
    setCurrentStorePack(storePack)
    setActionOpened(true)
  }
  const handleOperation = (type: string) => {
    try{
      if (!currentStorePack) return
      let packStore
      if (type === 'r') {
        packStore = {
          ...currentStorePack,
          lastUpdate: new Date()
        }
      } else {
        packStore = {
          ...currentStorePack,
          isActive: !currentStorePack.isActive,
          lastUpdate: new Date()
        }
      }
      editPrice(packStore, statePackPrices, statePacks, 'e')
      message(labels.editSuccess, 3000)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleEnterPrice = () => {
    try {
      if (!currentStorePack) return
      alert({
        header: labels.enterPrice,
        inputs: [
          {name: 'price', type: 'number', label: labels.price},
        ],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e) => handleEditPrice(Number(e.price))}
        ],
      })
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleEditPrice = (price: number) => {
    try{
      if (!currentStorePack) return
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const newStorePack = {
        ...currentStorePack,
        price : Math.round(+price * 100),
        lastUpdate: new Date()
      }
      editPrice(newStorePack, statePackPrices, statePacks, 'e')
      message(labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDeletePrice = async () => {
    try {
      if (!currentStorePack) return
      if (await IonAlert(alert, labels.confirmationText)) {
        const packStore = {
          ...currentStorePack,
          isActive: false
        }
        editPrice(packStore, statePackPrices, statePacks, 'd')
        message(labels.deleteSuccess, 3000)
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  let i = 0
  return(
    <IonPage>
      <Header title={store.name} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {storePacks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : storePacks.map(p => 
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.name} {!!p.pack.subPackId && <IonBadge color="success">{labels.offer}</IonBadge>}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{p.category.name}</IonText>
                  <IonText style={{color: colors[5].name}}>{moment(p.lastUpdate).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={ellipsisVerticalOutline}
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleActions(p)}
                />

              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      {store.id !== 's' &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/store-pack-add/${params.id}`} color="success">
            <IonIcon ios={addOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.refresh,
            cssClass: colors[i++ % 10].name,
            handler: () => handleOperation('r')
          },
          {
            text: currentStorePack?.isActive ? labels.deactivate : labels.activate,
            cssClass: colors[i++ % 10].name,
            handler: () => handleOperation('s')
          },
          {
            text: labels.editPrice,
            cssClass: colors[i++ % 10].name,
            handler: () => handleEnterPrice()
          },
          {
            text: labels.delete,
            cssClass: colors[i++ % 10].name,
            handler: () => handleDeletePrice()
          },
        ]}
      />

      <Footer />
    </IonPage>
  )
}

export default StorePackList
