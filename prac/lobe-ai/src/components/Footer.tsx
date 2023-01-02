import DownloadButton from "./DownloadButton"
import styled from 'styled-components';
const FooterContainer = styled.footer`
width: 100%;
display:  flex;
flex-direction: column;
align-items:center;
position: absolute;
bottom:0;
`;

const Footer = () => {
  return (
    <FooterContainer>
        <div className="">
            <h1>Train your app with lobe</h1>
            <DownloadButton/>
        </div>
        <hr />
        <div className=""></div>
    </FooterContainer>
  )
}

export default Footer
