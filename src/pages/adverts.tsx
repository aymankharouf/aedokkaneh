import { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Link, Actions, ActionsButton } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { updateAdvertStatus, showMessage, showError, getMessage, deleteAdvert } from '../data/actions'
import { advertType } from '../data/config'
import { Advert } from '../data/types'

const Adverts = () => {
  const { state } = useContext(StateContext)
  const [currentAdvert, setCurrentAdvert] = useState<Advert>()
  const [error, setError] = useState('')
  const [adverts, setAdverts] = useState<Advert[]>([])
  const actionsList = useRef<Actions>(null)
  useEffect(() => {
    setAdverts(() => [...state.adverts].sort((a1, a2) => a2.time > a1.time ? 1 : -1))
  }, [state.adverts])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAction = (advert: Advert) => {
    setCurrentAdvert(advert)
    actionsList.current?.open()
  }
  const handleUpdate = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        if (!currentAdvert) return
        updateAdvertStatus(currentAdvert, state.adverts)
        showMessage(labels.editSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        if (!currentAdvert) return
        deleteAdvert(currentAdvert)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }
  return (
    <Page>
      <Navbar title={labels.adverts} backLink={labels.back} />
      <Block>
        <List mediaList>
          {adverts.length === 0 ? 
            <ListItem title={labels.noData} />
          : adverts.map(a =>
              <ListItem
                title={advertType.find(t => t.id === a.type)?.name}
                subtitle={a.title}
                text={a.text}
                footer={moment(a.time).fromNow()}
                key={a.id}
                className={currentAdvert && currentAdvert.id === a.id ? 'selected' : ''}
              >
                <div className="list-subtext1">{a.isActive ? labels.isActive : labels.inActive}</div>
                <Link slot="after" iconMaterial="more_vert" onClick={()=> handleAction(a)}/>
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-advert/">
        <Icon material="add"></Icon>
      </Fab>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/advert-details/${currentAdvert?.id}`)}>{labels.details}</ActionsButton>
        <ActionsButton onClick={() => handleDelete()}>{labels.delete}</ActionsButton>
        <ActionsButton onClick={() => handleUpdate()}>{currentAdvert?.isActive ? labels.stop : labels.activate}</ActionsButton>
      </Actions>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Adverts