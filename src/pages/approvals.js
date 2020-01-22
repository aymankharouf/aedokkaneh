import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { randomColors } from '../data/config'

const Approvals = props => {
  const { state } = useContext(StoreContext)
  const newOrders = useMemo(() => state.orders.filter(o => o.status === 'n')
  , [state.orders])
  const orderRequests = useMemo(() => state.orderRequests.filter(r => r.status === 'n')
  , [state.orderRequests])
  const newUsers = useMemo(() => state.users.filter(u => !state.customers.find(c => c.id === u.id))
  , [state.users, state.customers])
  const alarms = useMemo(() => state.users.filter(u => u.alarms?.find(i => i.status === 'n'))
  , [state.users])
  const passwordRequests = useMemo(() => state.passwordRequests.filter(r => r.status === 'n')
   , [state.passwordRequests])
   const ratings = useMemo(() => state.users.filter(u => u.ratings?.find(r => r.status === 'n'))
  , [state.users])
  const invitations = useMemo(() => state.users.filter(u => u.invitations?.find(i => i.status === 'n'))
  , [state.users])
  const sections = useMemo(() => [
    {id: '1', name: 'الطلبات', path: '/orders-list/n', count: newOrders.length},
    {id: '2', name: 'تعديل الطلبات', path: '/order-requests/', count: orderRequests.length},
    {id: '3', name: 'المستخدمين', path: '/new-users/', count: newUsers.length},
    {id: '4', name: 'الاشعارات', path: '/alarms/', count: alarms.length},
    {id: '5', name: 'طلبات كلمة السر', path: '/password-requests/', count: passwordRequests.length},
    {id: '6', name: 'التقييمات', path: '/ratings/', count: ratings.length},
    {id: '7', name: 'الدعوات', path: '/invitations/', count: invitations.length},
  ], [newOrders, newUsers, alarms, passwordRequests, ratings, orderRequests, invitations])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.approvals} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            text={`${s.name} ${s.count > 0 ? '(' + s.count + ')' : ''}`}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id}
          />
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Approvals
