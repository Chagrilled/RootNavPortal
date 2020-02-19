// @flow
import React, { Component } from 'react';
import { APPHOME, CONFIG } from '../../../constants/globals';
import { existsSync, writeFile } from 'fs';
import { StyledButton } from '../StyledComponents'; 

export default class RemoveButton extends Component {

    deleteFolder = () => {
        if (!this.props.path) return;
        const filteredPaths = this.props.folders.filter(folder => folder.path !== this.props.path);
        if (existsSync(APPHOME))    //Rewrite config file with removed directories so they don't persist
            writeFile(APPHOME + CONFIG , JSON.stringify(filteredPaths, null, 4), err => {
                if (err) console.err(err); //idk do some handling here
            });
        this.props.remove(this.props.path);
    }
    
    render() { 
        return (
            <StyledButton
                variant="danger" 
                onClick={e => {
                    this.deleteFolder();
                    e.stopPropagation()
                }} 
                className={`btn btn-default fas fa-trash-alt button`} 
            />    
        )
    }
}