import React from 'react'
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';

const LayoutContainer = styled.div`
display: flex;
flex-direction:column;
align-items:center;
width: 100vw;
outline: 1px solid  #04DDB2
`;
const InnerLayoutContainer = styled.div`
padding: 0px,2px;
max-width: 70%
outline: 1px solid #04DDB2
`

function Layout(props:{
    children : React.ReactNode
}) {

    const {children}= props
  return (

    <LayoutContainer>
        <Navbar/>
        <InnerLayoutContainer>
            {children}
        </InnerLayoutContainer>
        <Footer/>
    </LayoutContainer>
  )
}

export default Layout