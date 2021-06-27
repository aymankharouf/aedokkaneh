import { useState } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'


const Settings = () => {
  const [sections] = useState(() => [
    {id: '1', name: labels.countries, path: '/countries/'},
    {id: '2', name: labels.categories, path: '/categories/0'},
    {id: '3', name: labels.regions, path: '/regions/'},
    {id: '4', name: labels.adverts, path: '/adverts/'}
  ])
  let i = 0
  return(
    <Page>
      <Navbar title={labels.settings} backLink={labels.back} />
      <Block>
        {sections.map(s => 
          <Button 
            text={s.name} 
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={s.path} 
            key={s.id} 
          />
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Settings
