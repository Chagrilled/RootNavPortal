// @flow
import React, { Component } from 'react';
import { StyledTopBarDiv, StyledTopBarHR } from '../CommonStyledComponents'
import LeftButton from '../buttons/viewer/LeftButton';
import RightButton from '../buttons/viewer/RightButton';
import ResetChangesButton from '../containers/viewer/ResetButtonContainer';
import SaveRSMLButton from '../containers/viewer/SaveButtonContainer';
import UndoChangesButton from '../containers/viewer/UndoButtonContainer';
import { StyledRow } from './StyledComponents';
import { matchPathName } from '../../constants/globals';
import { Row } from 'react-bootstrap';

export default class TopBar extends Component {

    render() {
        const { path, buttonHandler, plants, date, hasSegMasks } = this.props;
        const splitPath = matchPathName(path);
        let tag = path ? splitPath.fileName : ""; //Matches the file path into the absolute directory path and file name
        const folderFiles = this.props.files[splitPath.path];

        const noRSMLInFolder = !Object.values(folderFiles).some(file => file.parsedRSML);
        return (
            <div>
                <StyledTopBarDiv data-tid="container">
                    <StyledRow>
                        <div className="col-sm-4"><b>Tag:</b> {tag}</div>
                        <div className="col-sm-2">{
                            noRSMLInFolder ? <b>No RSML found in Folder</b> : <><b>Open Image:</b> {Object.keys(folderFiles).indexOf(tag) + 1} of {Object.keys(folderFiles).length}</>
                        }</div>
                        <div className="col-sm-3"><b>Analysis Date:</b> {date}</div>
                        <div className="col-sm-3"><b>Number of Plants:</b> {plants}</div>
                    </StyledRow>
                </StyledTopBarDiv>
                <StyledTopBarHR/>
                <StyledTopBarDiv className="d-inline-flex container" data-tid="container" style={{paddingTop: '0', minWidth: '100%'}}>
                    <Row style={{width: "100%"}}>
                        <div className="col-4" style={{display: "-webkit-box"}}>
                            <div className="custom-control custom-checkbox" style={{margin: 'auto 0 auto 1em', width: "auto"}}>
                                <input type="checkbox" className="custom-control-input" id="architecture" defaultChecked={true} onClick={this.props.toggleArch} />
                                <label className="custom-control-label" htmlFor="architecture">Architecture</label>
                            </div>
                            <div className="custom-control custom-checkbox" style={{margin: 'auto 1em auto 1em'}}>
                                <input type="checkbox" className="custom-control-input" disabled={!hasSegMasks} id="segMasks" onClick={this.props.toggleSegMasks}/>
                                <label className="custom-control-label" htmlFor="segMasks">Segmentation Masks</label>
                            </div>
                        </div>
                        <div className="col-4" style={{textAlign: "center"}}>
                            <LeftButton click={buttonHandler}/>
                            <RightButton click={buttonHandler}/>
                        </div>
                        <div className="col-4" style={{textAlign: "right"}}>
                            <ResetChangesButton />
                            <UndoChangesButton />
                            <SaveRSMLButton path={path} />
                        </div>
                    </Row>
                </StyledTopBarDiv>
            </div>
        );
    }
}
