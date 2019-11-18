import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Settings = props => {
  const { state } = useContext(StoreContext)
  const sections = useMemo(() => [
    {id: '1', name: 'الدول', path: 'countries'},
    {id: '2', name: 'اﻻقسام', path: 'sections'},
    {id: '3', name: 'العلامات التجارية', path: 'trademarks'},
    {id: '4', name: 'المواقع', path: 'locations'},
  ], [])
  let i = 0
  return(
    <Page>
      <Navbar title={state.labels.settings} backLink={state.labels.back} />
      <Block>
        {sections.map(s => {
            return (
            <Button large fill className="sections" color={state.randomColors[i++ % 10].name} href={`/${s.path}/`} key={s.id}>
                {s.name}
            </Button>
            )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Settings
