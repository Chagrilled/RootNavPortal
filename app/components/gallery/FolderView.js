// @flow
import React, { Component } from 'react';
import RemoveButton from '../containers/gallery/RemoveButtonContainer';
import Thumbnail from '../containers/gallery/ThumbnailContainer';
import { readdir, readFile } from 'fs';
import { StyledHR, StyledFolderViewDiv, StyledRow } from './StyledComponents'
import { StyledIcon } from '../CommonStyledComponents'
import { Row } from 'react-bootstrap';
import parser from 'fast-xml-parser';
import { sep } from 'path';
type Props = {};

export default class FolderView extends Component<Props> {
	props: Props;

	shouldComponentUpdate(nextProps, nextState) 
	{
		if (nextProps.filterText !== this.props.filterText) return true;
		if (!this.props.files) return true;	//If the folder has no files, don't re-render
		return nextProps.isActive !== this.props.isActive || (JSON.stringify(nextProps.files) !== JSON.stringify(this.props.files))
	}

	render() {

		let xmlOptions = {
			attributeNamePrefix: "@_",
			attrNodeName: "attr", //default is 'false'
			textNodeName: "#text",
			ignoreAttributes: false,
			ignoreNameSpace: false,
			allowBooleanAttributes: false,
			parseNodeValue: true,
			parseAttributeValue: true,
			trimValues: true,
			decodeHTMLchar: true,
			cdataTagName: "__cdata", //default is 'false'
			cdataPositionChar: "\c"
		};

		//folder - the full path to this folder - in state.gallery.folders
		//files - object of objects keyed by file name, that are in this folder only - state.gallery.files[folder]
		const { isActive, folder, filterText, files } = this.props; 
		if (!this.props.files) {
			let structuredFiles = {};
			readdir(folder, (err, files) => {
				let matched = files.map(file => file.match(/(.+)\.(rsml|tiff|png|jpg|jpeg)$/)) //Scan for file types we use
				matched.forEach(regex => { //Structure of this array will be [original string, file name, file extension, some other stuff]
					if (regex) 
					{
						let name = regex[1]; //Each file has an object with the key as the file name
						let ext  = regex[2];  //that key's value is an object that holds the extensions we found as bools
						if (!structuredFiles[name]) structuredFiles[name] = {} // if there is rsml and the png you'll get filename: {rsml: true, png: true}

						structuredFiles[name][ext] = true; //This assumes filename stays consistent for variants of the file. They have to, else there'll be no link I guess. 2x check API behaviour on this.
						
						//Unsure about how well this well scale. I think the parsing is sync, but it's apparently so fast it might not matter at all. Depends how much RSML we have.
						if (ext == 'rsml')
						{
							readFile(folder+sep+name+"."+ext, 'utf8', (err, data) => {
								structuredFiles[name].parsedRSML = parser.parse(data, xmlOptions);
							});
						}
					}
				});
				if (Object.keys(structuredFiles).length) 
				{
					this.props.addFiles(folder, structuredFiles); //Add our struct with the folder as the key to state
				}
			});		
		}

		if (!filterText || (files && Object.keys(files).some(file => file.toLowerCase().includes(filterText.toLowerCase()))))
		{
			return (
				<div>
					<StyledFolderViewDiv>
						<RemoveButton path={folder}/>
						<StyledIcon className={"fas fa-chevron-" + (isActive ?  "down" : "right") + " fa-lg"}/>
						{folder}
					</StyledFolderViewDiv>
					{
							(isActive && files && folder) ? <StyledFolderViewDiv><Row> {Object.keys(files)
							.filter(file => !filterText || file.toLowerCase().includes(filterText.toLowerCase()))
							.map((file, index) => {
								return (
									<div key={index} className="col-lg-3 col-xl-2 col-md-4 col-sm-6">
										<Thumbnail folder={folder} fileName={file}/>
									</div>
								);
							})} </Row></StyledFolderViewDiv> : ""							
						}
					<StyledHR/>
				</div>
				);
		}
		else return "";
	}
}
