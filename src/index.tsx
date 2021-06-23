import ReactDOM from 'react-dom'
import * as serviceWorker from './service-worker'
// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle'

// Import Framework7-React plugin
import Framework7React from 'framework7-react'

// Import main App component
import App from './app'


// Framework7 styles
import 'framework7/css/framework7.bundle.rtl.min.css'

// Icons
import './css/icons.css'

// Custom app styles
import './css/app.css'

// Init Framework7-React plugin
Framework7.use(Framework7React)

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register()
