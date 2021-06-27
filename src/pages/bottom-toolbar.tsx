import { useContext, useState, useEffect } from 'react'
import { Icon, Link, Badge} from 'framework7-react'
import { StateContext } from '../data/state-provider'

const BottomToolbar = () => {
  const { state } = useContext(StateContext)
  const [basketLink, setBasketLink] = useState('')
  const [basketCount, setBasketCount] = useState(0)
  useEffect(() => {
    const basketCount = state.basket?.packs?.length || 0
    const returnBasketCount = state.returnBasket?.packs?.length || 0
    setBasketLink(() => {
      if (basketCount > 0) return '/basket/'
      if (returnBasketCount > 0 ) return '/return-basket/'
      return ''
    })
    setBasketCount(() => {
      if (basketCount > 0) return basketCount
      if (returnBasketCount > 0 ) return returnBasketCount
      return 0
    })
  }, [state.basket, state.returnBasket])
  return (
    <>
      <Link href="/home/" iconMaterial="home" />
      <Link href={basketLink}>
        <Icon material='shopping_cart' >
          {basketCount > 0 ? <Badge color="red">{basketCount}</Badge> : ''}
        </Icon>
      </Link>
    </>
  )
}

export default BottomToolbar
