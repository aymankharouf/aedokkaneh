import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { Category, Err, Pack, PackPrice, State, Store } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import moment from 'moment'
import 'moment/locale/ar'
import { editPrice, getMessage } from '../data/actions'
import IonAlert from './ion-alert'

type Params = {
  id: string
}
type ExtendedPackPrice = PackPrice & {
  pack: Pack,
  category: Category
}

const StorePackList = () => {
  const params = useParams<Params>()
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const [selectedPacks, setSelectedPacks] = useState<ExtendedPackPrice[]>([])
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
  const handleActions = () => {
    setActionOpened(true)
  }
  const handleOperation = (type: string) => {
    try{
      let packStore
      if (type === 'r') {
        selectedPacks.forEach(p => {
          const { pack, category, ...others } = p
          editPrice({...others, lastUpdate: new Date()}, statePackPrices, statePacks, 'e')
        })
      } else {
        const { pack, category, ...others } = selectedPacks[0]
        packStore = {
          ...others,
          isActive: !others.isActive,
          lastUpdate: new Date()
        }
        editPrice(packStore, statePackPrices, statePacks, 'e')
      }
      message(labels.editSuccess, 3000)
      setSelectedPacks([])
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleEnterPrice = () => {
    try {
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
      if (!selectedPacks[0]) return
      if (Number(price) !== Number(Number(price).toFixed(2))) {
        throw new Error('invalidPrice')
      }
      const { pack, category, ...others } = selectedPacks[0]
      const newStorePack = {
        ...others,
        price : Math.round(+price * 100),
        lastUpdate: new Date()
      }
      editPrice(newStorePack, statePackPrices, statePacks, 'e')
      message(labels.editSuccess, 3000)
      setSelectedPacks([])
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDeletePrice = async () => {
    try {
      if (!selectedPacks[0]) return
      if (await IonAlert(alert, labels.confirmationText)) {
        const { pack, category, ...others } = selectedPacks[0]
        const packStore = {
          ...others,
          isActive: false
        }
        editPrice(packStore, statePackPrices, statePacks, 'd')
        message(labels.deleteSuccess, 3000)
        setSelectedPacks([])
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleSelected = (storePack: ExtendedPackPrice) => {
    if (selectedPacks.find(p => p.packId === storePack.packId)) {
      const others = selectedPacks.filter(p => p.packId !== storePack.packId)
      setSelectedPacks(others)
    } else {
      setSelectedPacks([...selectedPacks, storePack])
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
              <IonItem key={i++} onClick={() => handleSelected(p)} className={selectedPacks.find(s => s.packId === p.packId) ? 'selected' : ''}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.name} {p.pack.isOffer && <IonBadge color="success">{labels.offer}</IonBadge>}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.category.name}</IonText>
                  <IonText style={{color: colors[4].name}}>{moment(p.lastUpdate).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)}</IonLabel>
                <IonLabel slot="end">{!p.isActive && <IonBadge color="danger">{labels.inActive}</IonBadge>}</IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={handleActions}>
          <IonIcon ios={ellipsisVerticalOutline} /> 
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.add,
            cssClass: colors[i++ % 10].name,
            handler: () => history.push(`/store-pack-add/${params.id}`)
          },
          {
            text: labels.refresh,
            cssClass: selectedPacks.length > 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleOperation('r')
          },
          {
            text: selectedPacks[0]?.isActive ? labels.deactivate : labels.activate,
            cssClass: selectedPacks.length === 1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleOperation('s')
          },
          {
            text: labels.editPrice,
            cssClass: selectedPacks.length === 1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleEnterPrice()
          },
          {
            text: labels.delete,
            cssClass: selectedPacks.length === 1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDeletePrice()
          },
        ]}
      />

      <Footer />
    </IonPage>
  )
}

export default StorePackList
