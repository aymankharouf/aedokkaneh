import { IonButtons, IonHeader, IonIcon, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { chevronForwardOutline } from 'ionicons/icons'
import { useState } from 'react'
import { useHistory } from 'react-router'
import labels from '../data/labels'
import { useSelector, useDispatch } from 'react-redux'
import { State } from '../data/types'

type Props = {
  title?: string,
  withSearch?: boolean
}
const Header = (props: Props) => {
  const dispatch = useDispatch()
  const stateSearchText = useSelector<State, string>(state => state.searchText)
  const [visible, setVisible] = useState(false)
  const history = useHistory()
  const handleVisible = () => {
    dispatch({type: 'CLEAR_SEARCH'})
    setVisible(true)
  }
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start" onClick={() => history.goBack()}>
          <IonIcon
            ios={chevronForwardOutline} 
            color="primary" 
            style={{fontSize: '20px', marginRight: '10px'}} 
          />
        </IonButtons>
        {props.withSearch && 
          <IonButtons slot="end" onClick={handleVisible}>
            <IonIcon 
              name="search-outline" 
              color="primary" 
              size="small" 
              style={{fontSize: '20px', marginLeft: '10px'}}
            />
          </IonButtons>
        }
        <IonTitle>{props.title}</IonTitle>
      </IonToolbar>
      {visible && 
        <IonToolbar>
          <IonSearchbar
            placeholder={labels.search} 
            value={stateSearchText} 
            onIonChange={e => dispatch({type: 'SET_SEARCH', payload: e.detail.value})}
          />
        </IonToolbar>
      }
    </IonHeader>
  )
}

export default Header