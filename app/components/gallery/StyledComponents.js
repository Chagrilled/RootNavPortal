import styled from 'styled-components';
import { Row, Card } from 'react-bootstrap';

export const StyledFolderViewDiv = styled.div` && {
    min-height: 3em;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -ms-flex-align: center;
    -webkit-align-items: center;
    -webkit-box-align: center;
    align-items: center;
    margin: 0 2em;
    padding: 0.5em 0;
    overflow: hidden;
}`;
    
export const StyledFilterBarSpan = styled.span` && {
    width: 27em;
    margin: auto 0 auto 1em;
}`

export const StyledGalleryViewH1 = styled.h1` && {
    margin-left: 1.5em
}`
    
export const StyledGalleryViewDiv = styled.div` && {
    position: fixed;
    overflow-y: overlay;
    bottom: 0;
    top: 10em;
    left: 0;
    right: 0;
}`
    
export const StyledImage = styled.img` && {
    display: block;
    width: 100%;
    max-height: 5%;
}`

export const StyledRow = styled(Row)` && {
    width: 100%;
    line-height: 2vh;
}`


export const StyledFolderCard = styled(Card)` && {
    margin: 0 2.5em 1em;
}`

export const StyledImageCard = styled(Card)` && {
    -webkit-transition: 0.2s;
    width: auto;
    height: fit-content;
    border-radius: 5px;
    overflow: hidden;
    &:hover {
        background-color: #e2e5ea !important;
        filter: ${props => (props.clickable ? 'drop-shadow(8px 8px 4px #b4b7bb)' : '0')};
    } 
}`
export const StyledCardHeader = styled(Card.Header)` && {
    padding: 0;
    -webkit-transition: 0.2s;
    &:hover {
        background-color: #e2e5ea !important;
        cursor: pointer;
    }        
}`


export const StyledCardBody = styled(Card.Footer)` && {
    padding: 0em;
    height: 100%;
}`

export const StyledCardText = styled.div` && {
    display: flex;
    align-items: flex-end;
}`