import { useMemo } from 'react'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { colors, stockOperationTypes } from '../data/config'
import { Pack, State, StockOperation, Store } from '../data/types'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

type Props = {
  id: string,
  type: string
}
const StockOperationDetails = (props: Props) => {
  const stateArchivedStockOperations = useSelector<State, StockOperation[]>(state => state.archivedStockOperations)
  const stateStockOperations = useSelector<State, StockOperation[]>(state => state.stockOperations)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateStores = useSelector<State, Store[]>(state => state.stores)
  const stockOperation = useMemo(() => props.type === 'a' ? stateArchivedStockOperations.find(t => t.id === props.id)! : stateStockOperations.find(t => t.id === props.id)!, [stateArchivedStockOperations, stateStockOperations, props.id, props.type])
  const stockOperationBasket = useMemo(() => stockOperation.basket.map(p => {
      const packInfo = statePacks.find(pa => pa.id === p.packId)!
      return {
        ...p,
        packInfo
      }
    })
  , [stockOperation, statePacks])
  return(
    <IonPage>
      <Header title={`${stockOperationTypes.find(ty => ty.id === stockOperation.type)?.name} ${stockOperation.storeId ? stateStores.find(s => s.id === stockOperation.storeId)?.name : ''}`}/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stockOperationBasket.map(p => 
            <IonItem key={p.packId}>
              <IonThumbnail slot="start">
                <img src={p.packInfo.imageUrl} alt={labels.noImage} />
              </IonThumbnail>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.packInfo.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.packInfo.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
              </IonLabel>
              {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              <IonLabel slot="end" className="price">{(Math.round(p.price * (p.weight || p.quantity)) / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          )}
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default StockOperationDetails
