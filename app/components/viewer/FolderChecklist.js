import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { matchPathName } from '../../constants/globals';
import CheckboxTree from 'react-checkbox-tree'
import { StyledCard } from './StyledComponents'
import TooltipOverlay from '../common/TooltipOverlay';
import { StyledIcon } from '../CommonStyledComponents';

export default class FolderChecklist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: [props.path],
            expanded: [],
            nodes: []
        }
    }

    componentDidMount() {
        this.reset();
        this.props.updateChecked(this.state.checked);
    }   

    reset = () => {
        const folderPaths = this.props.folders.map(it => it.path);
        const tree = this.folderListToTree(folderPaths);
        const { checked, expanded } = this.state;
        this.setState({
          checked: checked.filter(it => folderPaths.includes(it)),
          expanded: expanded.length != 0 ? expanded.filter(it => folderPaths.includes(it)) : this.getDefaultExpanded(tree, folderPaths, checked),
          nodes: tree
        });
    }

    getDefaultExpanded = (tree, folderPaths, startingChecked) => {
        return folderPaths.filter(path => startingChecked.some(checked => checked.includes(path))).concat(tree.map(item => item.value));
    }

    // Converts a flat list of foldername strings into a hierarchical object representing folder structure
    folderListToTree = list => {
        let tree = [];
        list.forEach(path => {
            tree = this.addToChildren(path, tree)
        });
        return tree;
    }

    addToChildren = (path, children) => {
        let nodeIndex = children.findIndex(childNode => path.includes(childNode.value));
        if (nodeIndex != -1) children[nodeIndex].children = this.addToChildren(path, children[nodeIndex].children)
        else {
            const name = matchPathName(path).fileName;
            const style = path == this.props.path ? { padding: "2px 7px", background: "rgba(51, 51, 204, 0.3)", borderRadius: "5px", "&:hover": {background: "white"}} : {};
            children.push({ value: path, children: [], label: <span style={style} title={path}>{name}</span> });
        }
        return children;
    }

    cascadeChecked = (checked, clicked) => {
        return checked.includes(clicked.value) ? checked.concat(this.flattenChildren(clicked.children)) : checked;
    }

    flattenChildren = children => {
        return children.map(child => this.flattenChildren(child.children).concat(child.value)).flat();
    }

    componentDidUpdate(prevProps) {
        const folderPaths = this.props.folders.map(it => it.path);
        const oldFolderPaths = prevProps.folders.map(it => it.path);
        if (folderPaths.length != oldFolderPaths.length || prevProps.path != this.props.path) this.reset();
    }

    render() {
        const { nodes, checked, expanded } = this.state;
        const { updateChecked, updatePath } = this.props;
        return (
            <StyledCard style={{borderRadius: '0 .25rem 0 0', marginRight: "0.5em" }}>
                <Card.Header style={{ paddingTop: '0.5em', paddingBottom: '0.5em' }}>
                    <b>Select folders to measure</b>
                    <TooltipOverlay component={ props => <StyledIcon
                            className={`fas fa-info-circle`} 
                            {...props}
                        />} 
                        text={"Check a folder to add it to the measure group, and click the name to view its contents"}
                        placement={"top"}
                    /> 
                </Card.Header>
                <div style={{ padding: '0.5em' }}><CheckboxTree
                    noCascade={true}
                    nodes={nodes}
                    checked={checked}
                    expanded={expanded}
                    checkModel={'all'}
                    icons={{
                        check: <i className="far fa-check-square"/>,
                        uncheck: <i className="far fa-square"/>,
                        halfCheck: <i className="far fa-minus-square"/>,
                        expandClose: <i className="fas fa-chevron-right"/>,
                        expandOpen: <i className="fas fa-chevron-down"/>,
                        expandAll: <i className="fas fa-plus-square"/>,
                        collapseAll: <i className="fas fa-minus-square"/>,
                        parentClose: <i className="far fa-folder"/>,
                        parentOpen: <i className="far fa-folder-open"/>,
                        leaf: <i className="far fa-folder"/>,
                    }}
                    showExpandAll={true}
                    onCheck={(rawChecked, clicked) => { 
                        const checked = this.cascadeChecked(rawChecked, clicked);
                        this.setState({ checked })
                        updateChecked(checked);
                    }} 
                    onClick={node => { if (node.value != this.props.path) updatePath(node.value) }}
                    onExpand={expanded => this.setState({ expanded })}
                /></div>
            </StyledCard>
        );
    }
}