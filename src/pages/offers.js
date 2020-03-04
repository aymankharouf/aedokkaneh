import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import labels from '../data/labels'
import { haltOffer, showMessage, getMessage, showError } from '../data/actions'

const Offers = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [offers, setOffers] = useState([])
  useEffect(() => {
    setOffers(() => {
      let offers = state.packPrices.filter(p => p.offerEnd)
      offers = offers.map(o => {
        const packInfo = state.packs.find(p => p.id === o.packId)
        const storeName = o.storeId ? (o.storeId === 'm' ? labels.multipleStores : state.stores.find(s => s.id === o.storeId).name) : ''
        return {
          ...o,
          packInfo,
          storeName
        }
      })
      return offers.sort((o1, o2) => o1.offerEnd.seconds - o2.offerEnd.seconds)
    })
  }, [state.packPrices, state.packs, state.stores])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleHaltOffer = storePack => {
    try{
      const offerEndDate = storePack.offerEnd.toDate().setHours(0, 0, 0, 0)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
          try{
            haltOffer(storePack, state.packPrices, state.packs)
            showMessage(labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setError(getMessage(props, err))
          }
        })
      } else {
        haltOffer(storePack, state.packPrices, state.packs)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.offers} backLink={labels.back} />
      <Block>
        <List mediaList>
          {offers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : offers.map(p => 
              <ListItem
                title={p.packInfo.productName}
                subtitle={p.packInfo.name}
                text={`${labels.productOf} ${p.packInfo.trademark ? labels.company + ' ' + p.packInfo.trademark + '-' : ''}${p.packInfo.country}`}
                footer={moment(p.offerEnd.toDate()).format('Y/M/D')}
                key={i++}
              >
                <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                {p.storeName ? <div className="list-subtext1">{`${labels.storeName}: ${p.storeName}`}</div> : ''}
                <div className="list-subtext2">{`${labels.price}: ${(p.price / 1000).toFixed(3)}`}</div>
                {p.price === 0 ? '' : 
                  <Button text={labels.haltOffer} slot="after" onClick={() => handleHaltOffer(p)} />
                }
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

export default Offers