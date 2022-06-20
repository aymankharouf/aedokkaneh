import { useEffect, useState } from 'react'
import { IonBadge, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { cartOutline, homeOutline } from 'ionicons/icons'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'
import { Basket, ReturnBasket, State } from '../data/types'

const Footer = () => {
  const stateBasket = useSelector<State, Basket | undefined>(state => state.basket)
  const stateReturnBasket = useSelector<State, ReturnBasket | undefined>(state => state.returnBasket)
  const [basketLink, setBasketLink] = useState('')
  const [basketCount, setBasketCount] = useState(0)
  useEffect(() => {
    const basketCount = stateBasket?.packs?.length || 0
    const returnBasketCount = stateReturnBasket?.packs?.length || 0
    setBasketLink(() => {
      if (basketCount > 0) return '/basket/'
      if (returnBasketCount > 0 ) return '/return-basket'
      return ''
    })
    setBasketCount(() => {
      if (basketCount > 0) return basketCount
      if (returnBasketCount > 0 ) return returnBasketCount
      return 0
    })
  }, [stateBasket, stateReturnBasket])
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