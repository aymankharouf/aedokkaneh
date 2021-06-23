import { App, Panel, View } from 'framework7-react'
import routes from './routes'
import Store from './data/store'

const app = () => {
  const f7params = {
    id: 'io.framework7.dokaneh',
    name: 'دكانة نت',
    theme: 'auto', 
    routes,
  }

  return (
    <Store>
      <App params={f7params}>
        <Panel right reveal themeDark>
          <View url="/panel/"/>
        </Panel>
          <View id="main-view" url="/" main className="safe-areas"/>
      </App>
    </Store>
  )
}

export default app
