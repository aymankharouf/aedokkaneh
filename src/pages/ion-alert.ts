import labels from "../data/labels"

const IonAlert = (alert: any, message: string) => {
  return new Promise<boolean>((resolve) =>
    alert({
      header: labels.confirmationTitle,
      message,
      buttons: [
        {text: labels.no, handler: () => resolve(false)},
        {text: labels.yes, handler: () => resolve(true)},
      ],
    })
  )
}
export default IonAlert