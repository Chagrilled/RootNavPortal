// @flow
import React, { Component } from 'react';
import { StyledButton } from '../StyledComponents'; 
import TooltipOverlay from '../../common/TooltipOverlay';

export default class RefreshButton extends Component {

    render() {    
        return (
            <TooltipOverlay component={ props => <StyledButton
                    variant="primary" 
                    className={`btn btn-default fas fa-sync button`} 
                    onClick={this.props.loadPlugins} 
                    {...props}
                />} 
                text={"Reload Plugins"}
            />    
        )
    }
}