import { IonIcon } from '@ionic/react'
import { star, starHalfOutline, starOutline } from 'ionicons/icons'

type Props = {
  rating: number,
  count: number,
}
const RatingStars = (props: Props) => {
  const fill = Math.floor(props.rating)
  const fillArray = Array.from(Array(fill).keys())
  const half = props.rating - fill >= 0.5 ? 1 : 0
  const outline = 5 - fill - half
  const outlineArray = Array.from(Array(outline).keys())
  const color = props.rating === 0 ? 'warning' : props.rating < 2.5 ? 'danger' : props.rating < 4 ? 'primary' : 'success'
  return (
    <>
      {props.count > 0 ? '(' + props.count + ')' : ''}
      {outlineArray.map(i => <IonIcon key={i} style={{fontSize: '1rem'}} ios={starOutline} color={color}></IonIcon>)}
      {half === 0 ? '' : <IonIcon style={{fontSize: '1rem'}} ios={starHalfOutline} color={color}></IonIcon>}
      {fillArray.map(i => <IonIcon key={i} style={{fontSize: '1rem'}} ios={star} color={color}></IonIcon>)}
    </>
  )
}

export default RatingStars