import React from 'react'
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';

const LayoutContainer = styled.div`
display: flex;
flex-direction:column;
align-items:center;
`;
const InnerLayoutContainer = styled.div`
padding: 0px,2px;
max-width: 70%
`

function Layout(props:{
    children : React.ReactNode
}) {
  return (
    <LayoutContainer>
        <Navbar/>
        <InnerLayoutContainer>
            {props.children}
        </InnerLayoutContainer>
        <Footer/>
    </LayoutContainer>
  )
}

export default Layout