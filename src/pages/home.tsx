import { useState } from 'react'
import { colors } from '../data/config'
import labels from '../data/labels'
import Footer from './footer'
import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const Home = () => {
  const [mainPages] = useState(() => [
    {id: '1', name: labels.orders, path: '/orders'},
    {id: '2', name: labels.stores, path: '/stores'},
    {id: '3', name: labels.products, path: '/products/0'},
    {id: '4', name: labels.purchases, path: '/purchases'},
    {id: '5', name: labels.customers, path: '/customers'},
    {id: '6', name: labels.stock, path: '/stock'},
    {id: '7', name: labels.spendings, path: '/spendings'},
    {id: '8', name: labels.notifications, path: '/notifications'}
  ])
  let i = 0
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-5px'}} /></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-15px'}} /></IonTitle>
          </IonToolbar>
        </IonHeader>
        {mainPages.map(p => 
          <IonButton
            routerLink={p.path} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}}
            key={p.id}
          >
            {p.name}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Home
