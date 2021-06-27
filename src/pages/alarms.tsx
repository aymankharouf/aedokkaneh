import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'
import { iAlarm, iCustomerInfo, iPack, iUserInfo } from '../data/interfaces'

interface ExtendedAlarm extends iAlarm {
  userInfo: iUserInfo,
  packInfo: iPack,
  customerInfo: iCustomerInfo
}
const Alarms = () => {
  const { state } = useContext(StoreContext)
  const [alarms, setAlarms] = useState<ExtendedAlarm[]>([])
  useEffect(() => {
    setAlarms(() => {
      const alarms = state.alarms.filter(a => a.status === 'n')
      const result = alarms.map(a => {
        const userInfo = state.users.find(u => u.id === a.userId)!
        const packInfo = state.packs.find(p => p.id === a.packId)!
        const customerInfo = state.customers.find(c => c.id === a.userId)!
        return {
          ...a,
          userInfo,
          customerInfo,
          packInfo,
        }
      })
      return result.sort((a1, a2) => a1.time > a2.time ? 1 : -1)
    })
  }, [state.alarms, state.packs, state.users, state.customers])
  return(
    <Page>
      <Navbar title={labels.alarms} backLink={labels.back} />
      <Block>
          <List mediaList>
            {alarms.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : alarms.map(a => 
                <ListItem
                  link={`/alarm-details/${a.id}/user/${a.userInfo.id}`}
                  title={alarmTypes.find(t => t.id === a.type)?.name}
                  subtitle={a.customerInfo.name}
                  text={`${a.packInfo.productName} ${a.packInfo.name}`}
                  footer={moment(a.time).fromNow()}
                  key={a.id}
                >
                  <img src={a.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                </ListItem>
              )
            }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Alarms
