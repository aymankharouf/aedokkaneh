import { useMemo, useState } from 'react'
import labels from '../data/labels'
import { getMessage, unfoldStockPack } from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { Err, Pack, State, Stock } from '../data/types'
import { useSelector } from 'react-redux'
import SmartSelect from './smart-select'

type Params = {
  id: string
}
const UnfoldStockPack = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStocks = useSelector<State, Stock[]>(state => state.stocks)
  const stockPack = useMemo(() => stateStocks.find(s => s.id === params.id)!, [stateStocks, params.id])
  const [quantity, setQuantity] = useState('')
  const [firstPackId, setFirstPackId] = useState('')
  const [firstPackCount, setFirstPackCount] = useState('')
  const [firstPackPercent, setFirstPackPercent] = useState('')
  const [secondPackId, setSecondPackId] = useState('')
  const [secondPackCount, setSecondPackCount] = useState('')
  const [secondPackPercent, setSecondPackPercent] = useState('')
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const pack = useMemo(() => statePacks.find(p => p.id === params.id), [statePacks, params.id])
  const firstPacks = useMemo(() => statePacks.filter(p => p.product.id === pack?.product.id && !p.isOffer), [statePacks, pack])
  const secondPacks = useMemo(() => statePacks.filter(p => !p.isOffer)
                                              .map(p => {
                                                return {
                                                  id: p.id,
                                                  name: `${p.product.name}-${p.product.alias} ${p.name}`
                                                }
                                              })
                                              .sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  , [statePacks]) 
  const handleSubmit = () => {
    try{
      if (+quantity > stockPack.quantity) {
        throw new Error('invalidValue')
      }
      if (Number(firstPackPercent) + Number(secondPackPercent) !== 100) {
        throw new Error('invalidPercents')
      }
      const firstStockPack = {
        packId: firstPackId,
        price: Math.floor(stockPack.price * (+firstPackPercent / 100) / +firstPackCount),
        quantity: +quantity * +firstPackCount!,
        weight: 0
      }
      let secondStockPack
      if (secondPackId) {
        secondStockPack = {
          packId: secondPackId,
          price: Math.floor(stockPack.price * (+secondPackPercent / 100) / +secondPackCount),
          quantity: +quantity * +secondPackCount,
          weight: 0
        }
      }
      unfoldStockPack(stockPack, pack!, stateStocks, +quantity, firstStockPack, secondStockPack)
      message(labels.executeSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <IonPage>
      <Header title={labels.unfoldPack} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.quantity}
            </IonLabel>
            <IonInput 
              value={quantity} 
              type="number" 
              clearInput
              onIonChange={e => setQuantity(e.detail.value!)} 
            />
          </IonItem>
          <IonItemDivider style={{fontSize: '0.9rem'}} color="primary">
            <IonLabel>{labels.firstPack}</IonLabel>
          </IonItemDivider>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.pack}
            </IonLabel>
            <IonSelect 
              interface="action-sheet"
              ok-text={labels.ok} 
              cancel-text={labels.cancel} 
              value={firstPackId}
              onIonChange={e => setFirstPackId(e.detail.value)}
            >
              {firstPacks.map(p => <IonSelectOption key={p.id} value={p.id}>{p.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.count}
            </IonLabel>
            <IonInput 
              value={firstPackCount} 
              type="number" 
              clearInput
              onIonChange={e => setFirstPackCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.percent}
            </IonLabel>
            <IonInput 
              value={firstPackPercent} 
              type="number" 
              clearInput
              onIonChange={e => setFirstPackPercent(e.detail.value!)} 
            />
          </IonItem>
          <IonItemDivider style={{fontSize: '0.9rem'}} color="primary">
            <IonLabel>{labels.secondPack}</IonLabel>
          </IonItemDivider>

          <SmartSelect label={labels.pack} data={secondPacks} value={secondPackId} onChange={(v) => setSecondPackId(v)} />
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.count}
            </IonLabel>
            <IonInput 
              value={secondPackCount} 
              type="number" 
              clearInput
              onIonChange={e => setSecondPackCount(e.detail.value!)} 
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.percent}
            </IonLabel>
            <IonInput 
              value={secondPackPercent} 
              type="number" 
              clearInput
              onIonChange={e => setSecondPackPercent(e.detail.value!)} 
            />
          </IonItem>
        </IonList>
      </IonContent>
      {quantity && firstPackId && firstPackCount && firstPackPercent && (!secondPackId || (secondPackCount && secondPackPercent)) &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default UnfoldStockPack
