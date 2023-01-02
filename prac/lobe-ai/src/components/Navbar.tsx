import  {useState} from 'react'
import DownloadButton from './DownloadButton';
import styled from 'styled-components';

const Nav = styled.nav`
display: flex;
align-items: center;
justify-content: space-between;
`;

const NavLinks = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
`;

const NavLink = styled.a<{$active: Boolean}>`
font-size: 18px;
color:#{props => props.$active? '#333333': '#767676'};
font-weight:500;
`;
const Logo = styled.h2`
font-size: 24px;
color: #333333'
`;

function Navbar() {
  const [activeLink, setActiveLink]=useState('Overview');
  const linkTitles = ['Overview', 'Examples', 'Tour', 'Blogs', 'Help']
  return (
    <Nav>
      <Logo></Logo>
      <NavLinks>
 {linkTitles.map((title: string, index:number)=>{
  return (
  <NavLink
  $active={title===activeLink}
  key={index}
  onClick={()=>setActiveLink(title)}>
    {title}
    </NavLink>)
 })}
      </NavLinks>
      <DownloadButton/>
    </Nav>
  )
}

export default Navbar