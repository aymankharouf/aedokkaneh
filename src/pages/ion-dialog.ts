import labels from "../data/labels"

const IonDialog = (alert: any, title: string) => {
  return new Promise<string>((resolve) =>
    alert({
      header: title,
      inputs: [
        {name: 'value', type: 'string'}
      ],
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: (e: any) => resolve(e.value)},
      ],
    })
  )
}
export default IonDialog