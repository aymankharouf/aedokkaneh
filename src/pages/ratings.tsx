import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { approveRating, showMessage, showError, getMessage } from '../data/actionst'
import { iProduct, iRating, iUserInfo } from '../data/interfaces'

interface ExtendedRating extends iRating {
  userInfo: iUserInfo,
  productInfo: iProduct
}
const Ratings = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [ratings, setRatings] = useState<ExtendedRating[]>([])
  useEffect(() => {
    setRatings(() => {
      const ratings = state.ratings.filter(r => r.status === 'n')
      return ratings.map(r => {
        const userInfo = state.users.find(u => u.id === r.userId)!
        const productInfo = state.products.find(p => p.id === r.productId)!
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
  const handleApprove = (rating: ExtendedRating) => {
    try{
      approveRating(rating, state.ratings, state.products, state.packs)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
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
