// @flow
import { existsSync, readdirSync, mkdirSync } from 'fs';
import React, { Component } from 'react';
import { Button, Row, Modal, InputGroup, Collapse, Toast, Spinner } from 'react-bootstrap'
import { PLUGINDIR, _require } from '../../constants/globals'
import Plugin from './Plugin';
import { StyledCard, StyledCardHeader, StyledCenterListGroupItem, StyledChevron, StyledCardContents, StyledMeasureButton } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import ClearButton from '../buttons/viewer/ClearButton';
import RefreshButton from '../buttons/viewer/RefreshButton';
import SelectDestinationButton from '../buttons/viewer/SelectDestinationButton';
import { StyledModal } from '../buttons/StyledComponents'; 
import { createObjectCsvWriter } from 'csv-writer';
import utils from '../../constants/pluginUtils';
import cloneDeep from 'lodash.clonedeep';

export default class PluginBar extends Component {
    
    constructor(props) 
    {
        super(props);
        const _plugins = this.loadPlugins();
        this.state = {
            ...Object.fromEntries(Object.keys(_plugins).map(group => [group, true])),
            plugins: _plugins,
            modal: false,
            exportable: true,
            toast: false,
            measuresComplete: false, //Toggles checkmark's animation state
            measuring: false //Toggles the collapse within the export modal
        };
        this.exportDest = React.createRef();
    }

    resetPlugins = () => {
        let plugins = cloneDeep(this.state.plugins);
        Object.values(plugins).forEach(group => Object.values(group).forEach(plugin => plugin.active = false));

        this.setState({ ...this.state,
            plugins
        });
    };

    render() {
        let pluginActive = Object.keys(this.state.plugins).some(group => Object.values(this.state.plugins[group]).some(plugin => plugin.active));
        return (
        <>
            <StyledCard style={{borderRadius: '.25rem 0 0 0', marginLeft: '0.5em'}}>
                <StyledCenterListGroupItem>
                    <RefreshButton/>
                    <ClearButton resetPlugins={this.resetPlugins}/>
                </StyledCenterListGroupItem>
                <StyledCardContents>
                {
                    Object.entries(this.state.plugins).map((pluginGroup, i) => {
                        const groupName = pluginGroup[0];
                        return (
                            <React.Fragment key={i}>
                                <StyledCardHeader variant="light" as={Button} onClick={() => this.togglePluginGroup(groupName)}>
                                    <Row>
                                        <StyledChevron className="col-2">
                                            <StyledIcon className={"fas fa-chevron-right fa-lg"} style={{transitionDuration: '0.5s', transform: `rotate(${this.state[groupName] ? '90' : '0'}deg)`}}/>
                                        </StyledChevron>
                                        <div className="col-8 text-center">{groupName}</div>
                                    </Row>
                                </StyledCardHeader>
                                <Collapse in={!!this.state[groupName]}>
                                    <div>
                                    {
                                        Object.entries(pluginGroup[1]).map((plugin, i) => {
                                            return <div key={i} onClick = {() => this.togglePlugin(groupName, plugin[0])}>
                                                <Plugin key={i} name={plugin[0]} active={plugin[1].active} description={plugin[1].description}/>
                                            </div>
                                        })
                                    }
                                    </div>
                                </Collapse>
                            </React.Fragment>
                        );
                    })
                }    
                </StyledCardContents>
                <StyledMeasureButton variant={pluginActive ? "primary" : "secondary"} onClick={this.measure} disabled={!pluginActive}>Measure</StyledMeasureButton>
            </StyledCard>

            <StyledModal show={this.state.modal} onHide={this.closeModal} style={{minWidth: 'max-content !important'}}>
                <Modal.Header closeButton>
                    <Modal.Title>Export Measurements</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup style={!this.state.exportable ? { boxShadow: '0 0 10px red', borderRadius: '7px 20px 20px 7px' } : {}}>
                        <InputGroup.Prepend>
                            <InputGroup.Text>
                                <StyledIcon className={"fas fa-save fa-lg"}/>
                            </InputGroup.Text> 
                        </InputGroup.Prepend>
                        <input key={0} type="text" className="form-control" readOnly ref={this.exportDest}/>
                        <InputGroup.Append>
                            <SelectDestinationButton setExportDest={this.setExportDest}/>
                        </InputGroup.Append>
                    </InputGroup>
                    <Collapse in={this.state.measuring}>
                        <div>
                            <div style={{ display: 'flex' }} className={"circle-loader" + (this.state.measuresComplete ? " load-complete" : "")}>
                                <div style={this.state.measuresComplete ? {display: 'block'} : {display: 'none'}} className={(this.state.measuresComplete ? "checkmark " : "") + "draw"}></div>
                            </div>
                        </div>
                    </Collapse>
                </Modal.Body>
                <Modal.Footer>
                    { this.checkAPIQueues() ? <span> <Spinner animation="border" variant="warning" style={{height: '1.5rem', width: '1.5rem', border: '0.2em solid currentColor', borderRightColor: 'transparent'}}/> Images in selected folders are still processing </span> : ""}
                    <Button variant={this.state.measuresComplete ? "success" : "danger"} onClick={this.closeModal} style={{transition: '0.2s ease-in-out'}}>
                        {this.state.measuresComplete ? "Close" : "Cancel"}
                    </Button>
                    <Button variant="primary" onClick={this.export}>
                        Measure
                    </Button>
                </Modal.Footer>
            </StyledModal> 

            <this.measureToast />
        </>
        );
    };

    //Returns true if any folder checked in this viewer window is queued or inflight
    checkAPIQueues = () => {
        let inflightQueue = Object.keys(this.props.apiInflight);
        for (let i = 0; i < this.props.folders.length; i++)
        {
            let folder = this.props.folders[i];
             //Using strings in regexes fucks up since the escaped \s need escaping for regex
            if (inflightQueue.findIndex(file => file.match(new RegExp(`${folder.replace(/\\/g, '\\\\')}\\\\[^\\\\]+`))) != -1 || this.props.apiQueue.indexOf(folder) != -1) 
                return true;
        }
        return false;
    };

    measureToast = () => {
        return (
            <Toast onClose={() => this.setState({ ...this.state, toast: false})} delay={4000} show={this.state.toast}  autohide style={{ position: 'absolute' }}
                style={{ position: 'absolute', bottom: '10vh', marginLeft: '50%', marginRight: '50%', transform: 'translateX(-50%)', minWidth: '15vw' }} >
                <Toast.Header>
                    <StyledIcon className={"fas fa-arrow-left fa-lg"} />
                    <strong className="mr-auto">Measure Error</strong>
                </Toast.Header>
                <Toast.Body>You have no folders selected for measuring</Toast.Body>
            </Toast>
        );
    };

    setExportDest = value => {
        this.exportDest.current.value = value;
        this.setState({ ...this.state, exportable: true });
    };

    //Modal's measure button clicked
    export = () => {
        if (!this.exportDest.current.value) return this.setState({ ...this.state, exportable: false });
        this.setState({ ...this.state, measuring: true });
        let funcs = []; //Stores an array of processing promises

        this.props.folders.forEach(folder => { //For each folder we get passed by the sidebar - this will be in Redux
            Object.values(this.props.files[folder]).forEach(file => { //For each file inside state for that folder
                if (file.parsedRSML) Object.values(this.state.plugins).forEach(group =>  //if we have rsml, for each plugin group
                    Object.values(group).forEach(plugin => plugin.active ? //for each active plugin
                        funcs.push(plugin.function(file.parsedRSML.rsmlJson, file.parsedRSML.polylines, utils)) : null)); //pass the data to each plugin
            });
        });

        //Plugins return a promise which they then resolve when they finish their processing. This barrier will then callback upon all plugins completing.
        Promise.all(funcs).then(results => {
            let headers = { //These are the fields for the CSV. If it's not in the headers, it won't get pulled and written as data.
                plant: [
                    { id: 'tag', title: 'Tag'}
                ],
                root: [
                    { id: 'tag', title: 'Tag'}
                ]
            };

            let data = { //Where each plugin's set of results get totalled
                plant: [],
                root: []
            };

            results.forEach(result => {
                let type = result.group.match(/([^\s]+)/)[1].toLowerCase(); //Use the plant/root group name to decide which section it goes in.
                headers[type] = headers[type] ? headers[type].concat(result.header) : [{ id: 'tag', title: 'Tag'}, ...result.header]; //Dump all the headers in for now. If it doesn't exist in plant/root group, assign it a new array with default tag.
                result.results.forEach(record => Object.keys(record).forEach(key => { if (/^-?\d+\.\d+$/.test(record[key])) record[key] = record[key].toFixed(3) })); //Round floats to 3 DP
                data[type] = this.mergeResults(data[type], result.results); //Combine results with what exists, merging on the tag, so we get one big object per 'thing'. Won't apply for things that measure primaries and lats separately as the tag will differ
            });
            
            Object.keys(headers).forEach(type => headers[type] = headers[type].reduce((filtered, item) => { //Once done, reduce and filter the list by object
                if (!filtered.some(header => JSON.stringify(header) == JSON.stringify(item))) filtered.push(item); //Each plugin will return a header for every root. This can be optimised, else big lookups will happen in big sets.
                return filtered;
            }, []));
            
            let multiFile = data.plant.length && data.root.length;

            Object.keys(data).forEach(type => {
                if (data[type].length)
                {   
                    let path = multiFile ? this.exportDest.current.value.replace(/([^\\\/.]+)(\..+)?$/, `$1 - ${type}$2`) : this.exportDest.current.value; //If writing multiple files, append the type

                    let csvWriter = createObjectCsvWriter({
                        path,
                        header: headers[type]
                    });
                    csvWriter.writeRecords(data[type]).then(() => console.log(`written to ${path}`));
                }
            });
            setTimeout(() => this.setState({ ...this.state, measuresComplete: true }), 225); //Tiny delay for the animation change so it doesn't collide with the collapse and get missed.
        });
    };

    //Merges any number of arrays of objects into an array of objects by their tag. All result sets must have a tag property, being the same for all measurements that should be merged together
    mergeResults = (...results) => Object.values(results.reduce((data, list) => {
        list.forEach(record => {
            if (data[record.tag]) data[record.tag] = Object.assign(data[record.tag], record);
            else data[record.tag] = record;
        });
        return data;
    }, {}));

    closeModal = () => {
        this.setState({...this.state, modal: false, measuresComplete: false, measuring: false });
    };

    //Plugin measure clicked, opens modal
    measure = () => {
        if (!this.props.folders.length) return this.setState({ ...this.state, toast: true });
        this.setState({ ...this.state, modal: true });
    };
    
    loadPlugins = () => {
        let plugins = {};

        // If there are no plugins, then make the plugin directory.
        if (!existsSync(PLUGINDIR)) { 
            console.log("No plugin directory found at '" + PLUGINDIR + "', creating!");
            mkdirSync(PLUGINDIR);
        }
        else 
        {
            console.log("Plugin directory found at '" + PLUGINDIR + "', reading plugins!");
            const pluginFilenames = readdirSync(PLUGINDIR); // Get all plugin filenames
            pluginFilenames.forEach(filename => {
                const plugin = _require(`${PLUGINDIR}${filename.replace('.js', '')}`); // For each filename, import the plugin
                
                if (["name", "group", "function", "description"].every(param => param in plugin)) { // If the plugins have all the necessary members, then add it to the plugins object.
                    // Todo good typechecking
                    if (!(plugin.group in plugins)) plugins[plugin.group] = {}; // Initialise empty object for group
                    plugins[plugin.group][plugin.name] = { "function": plugin.function, "active": false, description: plugin.description };
                }
                else console.log("Bad Plugin: " + JSON.stringify(plugin));
            });
        }
        return plugins;
    }

    togglePlugin = (groupName, pluginName) => {
        const { plugins } = this.state;
        if (!plugins.hasOwnProperty(groupName) || !plugins[groupName].hasOwnProperty(pluginName)) return;
        this.setState({
            ...this.state,
            plugins: {
                ...plugins,
                [groupName]: {
                    ...plugins[groupName],
                    [pluginName]: {
                    ...plugins[groupName][pluginName],
                    'active': !plugins[groupName][pluginName].active
                    }
                } 
            }
        });
    }

    togglePluginGroup = groupName => {
        if (!this.state.hasOwnProperty(groupName)) return;
        this.setState({
            ...this.state,
            [groupName]: !this.state[groupName]
        });
    };
}