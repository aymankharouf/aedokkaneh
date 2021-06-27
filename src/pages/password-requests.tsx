import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { PasswordRequest } from '../data/types'

const PasswordRequests = () => {
  const { state } = useContext(StateContext)
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests.sort((r1, r2) => r1.time > r2.time ? 1 : -1))
  }, [state.passwordRequests])

  return(
    <Page>
      <Navbar title={labels.passwordRequests} backLink={labels.back} />
      <Block>
          <List mediaList>
            {passwordRequests.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : passwordRequests.map(r => 
                <ListItem
                  link={`/retreive-password/${r.id}`}
                  title={r.mobile}
                  subtitle={r.status === 'n' ? labels.new : labels.resolved}
                  text={moment(r.time).fromNow()}
                  key={r.id}
                />
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

export default PasswordRequests
