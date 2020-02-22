import React, { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { approveRating, showMessage, showError, getMessage } from '../data/actions'

const Ratings = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [ratings, setRatings] = useState([])
  useEffect(() => {
    setRatings(() => {
      const ratings = state.ratings.filter(r => r.status === 'n')
      return ratings.map(r => {
        const userInfo = state.users.find(u => u.id === r.userId)
        const productInfo = state.products.find(p => p.id === r.productId)
        return {
          ...r,
          userInfo,
          productInfo
        }
      })
    })
  }, [state.users, state.products, state.ratings])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleApprove = async rating => {
    try{
      setInprocess(true)
      await approveRating(rating, state.packs)
      setInprocess(false)
      showMessage(labels.approveSuccess)
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.ratings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : ratings.map(r => 
              <ListItem
                title={r.productInfo.name}
                subtitle={`${r.userInfo.name}:${r.userInfo.mobile}`}
                key={i++}
              >
                <img slot="media" src={r.productInfo.imageUrl} className="img-list" alt={r.productInfo.name} />
                <Button text={labels.approve} slot="after" onClick={() => handleApprove(r)} />
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

export default Ratings
