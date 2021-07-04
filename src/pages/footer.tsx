import {useContext, useEffect, useState} from 'react'
import {StateContext} from '../data/state-provider'
import { IonBadge, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { cartOutline, homeOutline } from 'ionicons/icons'
import { useHistory } from 'react-router'

const Footer = () => {
  const {state} = useContext(StateContext)
  const [basketLink, setBasketLink] = useState('')
  const [basketCount, setBasketCount] = useState(0)
  useEffect(() => {
    const basketCount = state.basket?.packs?.length || 0
    const returnBasketCount = state.returnBasket?.packs?.length || 0
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
  }, [state.basket, state.returnBasket])
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