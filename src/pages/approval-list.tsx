import { useMemo } from 'react'
import labels from '../data/labels'
import { colors } from '../data/config'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { PasswordRequest, Rating, State, StoreTrans } from '../data/types'

const ApprovalList = () => {
  const stateRatings = useSelector<State, Rating[]>(state => state.ratings)
  const statePasswordRequests = useSelector<State, PasswordRequest[]>(state => state.passwordRequests)
  const stateStoreTrans = useSelector<State, StoreTrans[]>(state => state.storeTrans)
  const ratings = useMemo(() => stateRatings.filter(r => r.status === 'n').length, [stateRatings])
  const storeTrans = useMemo(() => stateStoreTrans.filter(t => t.status === 'n').length, [stateStoreTrans])
  const sections = useMemo(() => [
      {id: '1', name: labels.storeTrans, path: '/store-trans-list/0', count: storeTrans},
      {id: '2', name: labels.passwordRequests, path: '/password-requests', count: statePasswordRequests.length},
      {id: '3', name: labels.ratings, path: '/ratings', count: ratings},
    ]
  , [statePasswordRequests, ratings, storeTrans])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.approvals} />
      <IonContent fullscreen className="ion-padding">
        {sections.map(s => 
          <IonButton
            routerLink={s.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={s.id}
          >
            {`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default ApprovalList
