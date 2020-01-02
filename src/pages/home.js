import React, { useMemo } from 'react'
import {Page, Navbar, NavLeft, NavTitle, NavTitleLarge, Link, Block, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { randomColors } from '../data/config'


const Home = props => {
  const mainPages = useMemo(() => [
    {id: '1', name: 'الطلبات', path: 'orders'},
    {id: '2', name: 'اﻻسعار', path: 'prices'},
    {id: '3', name: 'المنتجات', path: 'products'},
    {id: '4', name: 'المشتريات', path: 'purchases'},
    {id: '5', name: 'العملاء', path: 'customers'},
    {id: '6', name: 'المستودع', path: 'stock'},
    {id: '7', name: 'المصاريف', path: 'spendings'}
  ], [])

  let i = 0
  return (
    <Page className="page-home">
      <Navbar large>
        <NavLeft>
          <Link iconMaterial="menu" panelOpen="right"></Link>
        </NavLeft>
        <NavTitle sliding><img src="/dokaneh_logo.png" alt="logo" className="logo" /></NavTitle>
        <NavTitleLarge><img src="/dokaneh_logo.png" alt="logo" className="logo" /></NavTitleLarge>
      </Navbar>
      <Block>
        {mainPages.map(p => 
          <Button 
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={`/${p.path}/`} 
            key={p.id}
          >
            {p.name}
          </Button>
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>

    </Page>
  )
}

export default Home
