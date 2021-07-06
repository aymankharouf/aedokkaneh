import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { quantityText } from '../data/actions'
import labels from '../data/labels'
import { colors, stockOperationTypes } from '../data/config'
import { Pack, StockPack } from '../data/types'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'

type Props = {
  id: string,
  type: string
}
type ExtendedStockPack = StockPack & {
  packInfo: Pack
}
const StockOperationDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [stockOperation] = useState(() => props.type === 'a' ? state.archivedStockOperations.find(t => t.id === props.id)! : state.stockOperations.find(t => t.id === props.id)!)
  const [stockOperationBasket, setStockOperationBasket] = useState<ExtendedStockPack[]>([])
  useEffect(() => {
    setStockOperationBasket(() => stockOperation.basket.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)!
      return {
        ...p,
        packInfo
      }
    }))
  }, [stockOperation, state.packs])
  return(
    <IonPage>
      <Header title={`${stockOperationTypes.find(ty => ty.id === stockOperation.type)?.name} ${stockOperation.storeId ? state.stores.find(s => s.id === stockOperation.storeId)?.name : ''}`}/>
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {stockOperationBasket.map(p => 
            <IonItem key={p.packId}>
              <IonThumbnail slot="start">
                <img src={p.packInfo.imageUrl} alt={labels.noImage} />
              </IonThumbnail>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packInfo.name}</IonText>
                <IonText style={{color: colors[3].name}}>{`${labels.quantity}: ${quantityText(p.quantity, p.weight)}`}</IonText>
              </IonLabel>
              {p.packInfo.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              <IonLabel slot="end" className="price">{(Math.round(p.cost * (p.weight || p.quantity)) / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          )}
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}
export default StockOperationDetails
