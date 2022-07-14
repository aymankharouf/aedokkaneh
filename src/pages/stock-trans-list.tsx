import { useState, useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, quantityText, unfoldStockPack, packStockOut } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import { Err, Pack, State, Stock } from '../data/types'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useHistory, useLocation, useParams } from 'react-router'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type Params = {
  id: string
}
const StockTransList = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id)!, [statePacks, params.id])
  const stockPack = useMemo(() => stateStocks.find(s => s.id === params.id)!, [stateStocks, params.id])
  const [actionOpened, setActionOpened] = useState(false)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [alert] = useIonAlert()
  const trans = useMemo(() => stockPack.trans?.sort((t1, t2) => t2.time > t1.time ? 1 : -1), [stockPack])
  const handleQuantity = (type: string, quantity: number, weight: number) => {
    try{
      if (quantity > stockPack.quantity) {
        throw new Error('invalidValue')
      }
      packStockOut(stockPack, quantity, weight, type)
      message(labels.executeSuccess, 3000)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }    
  }
  const handleAddOperation = (type: string) => {
    if (pack.quantityType === 'wc') {
      alert({
        header: labels.enterWeight,
        inputs: [
          {name: 'quantity', type: 'number', label: labels.quantity},
          {name: 'weight', type: 'number', label: labels.weight}
        ],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e) => handleQuantity(type, Number(e.quantity), Number(e.weight))}
        ],
      })
    } else {
      alert({
        header: labels.enterQuantity,
        inputs: [{name: 'quantity', type: 'number'}],
        buttons: [
          {text: labels.cancel},
          {text: labels.ok, handler: (e) => handleQuantity(type, Number(e.quantity), 0)}
        ],
      })
    }
  }
  const handleOpen = () => {
    alert({
      header: labels.enterQuantity,
      inputs: [{name: 'quantity', type: 'number'}],
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: (e) => handleUnfold(Number(e.quantity))}
      ],
    })
  }
  const handleUnfold = (quantity: number) => {
    try{
      if (quantity > stockPack.quantity) {
        throw new Error('invalidValue')
      }
      unfoldStockPack(stockPack, pack, stateStocks, quantity)
      message(labels.executeSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }      
  }
  let i = 0
  return(
    <IonPage>
      <Header title={`${pack.product.name} ${pack.name}`} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {trans?.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : trans?.map(t => 
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{stockTransTypes.find(tt => tt.id === t.type)?.name}</IonText>
                  <IonText style={{color: colors[2].name}}>{`${labels.price}: ${(t.price / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[3].name}}>{moment(t.time).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{quantityText(t.quantity, t.weight)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={() => setActionOpened(true)}>
          <IonIcon ios={ellipsisVerticalOutline} />
        </IonFabButton>
      </IonFab>
      <IonActionSheet
        mode="ios"
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.open,
            cssClass: pack.isOffer ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleOpen()
          },
          {
            text: labels.donate,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('g')
          },
          {
            text: labels.destroy,
            cssClass: colors[i++ % 10].name,
            handler: () => handleAddOperation('d')
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default StockTransList
