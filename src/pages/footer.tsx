import { useMemo } from 'react'
import { IonBadge, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { cartOutline, homeOutline } from 'ionicons/icons'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'
import { Basket, ReturnBasket, State } from '../data/types'

const Footer = () => {
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const stateReturnBasket = useSelector<State, ReturnBasket | undefined>(state => state.returnBasket)
  const basketLink = useMemo(() => stateBasket ? '/basket' : (stateReturnBasket ? '/return-basket' : ''), [stateBasket, stateReturnBasket])
  const basketCount = useMemo(() => stateBasket?.packs?.length || stateReturnBasket?.packs?.length || 0, [stateBasket, stateReturnBasket])
  const history = useHistory()
  return (
    <IonFooter>
      <IonToolbar>
        <IonButtons slot="start" onClick={() => history.push('/')}>
          <IonIcon 
            ios={homeOutline} 
            color="primary" 
            style={{fontSize: '20px', marginRight: '10px'}} 
          />
        </IonButtons>
        <IonButtons slot="end" onClick={() => {if (basketCount > 0) history.push(basketLink)}}>
          {basketCount > 0 && <IonBadge className="badge" style={{right: '10px'}}>{basketCount}</IonBadge>}
          <IonIcon 
            ios={cartOutline} 
            style={{fontSize: '25px', marginLeft: '10px'}} 
            color="primary"
          />
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  )
}

export default Footer