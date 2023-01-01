import React, {useState} from 'react'

const Nav = stylede.nav`
display: flex;
align-items: center;
justify-content: space-between;
`;

const NavLinks = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
`

const NavLink =styled.a`
font-size: 18px;
color: #333333;
`

function Navbar() {
  return (
    <nav>Navbar</nav>
  )
}

export default Navbar