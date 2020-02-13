// @flow
import React, { Component } from 'react';
import { readFileSync, readFile } from 'fs';
import parser from 'fast-xml-parser';
import { sep } from 'path';
import { IMAGE_EXTS_REGEX, matchPathName } from '../../constants/globals'
import imageThumb from 'image-thumbnail';
import Tiff from 'tiff.js';
import { fabric } from 'fabric';

export default class Render extends Component<Props> {
    constructor(props)
    {
        super(props);
        this.canvas = React.createRef();
    }

    colours = { PRIMARY: '#f53', LATERAL: '#ffff00' };
    rsmlPoints = [];
    canvasScaleDiv = 2; //Canvas scale is 1 / this. Used to clear the canvas with inverted scaling

    xmlOptions = {
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

    //Fires on each component update - not initial render - which is fine since our ref for drawing won't be active in render, and the state change from reading RSML will trigger an update
    componentDidUpdate()
    {
        this.draw();
    }

    draw = () => {
        const { file, path, architecture, segMasks, updateFile } = this.props;
        const ctx    = this.canvas.current.getContext("2d");
        const canvas = this.canvas.current;
        ctx.clearRect(0, 0, canvas.width * this.canvasScaleDiv , canvas.height * this.canvasScaleDiv); //Multiply dimensions by the inverse of the scale to clear the whole thing properly

        if (file.parsedRSML) //Ready to draw!
        {
            const { simplifiedLines } = file.parsedRSML;
            if (!simplifiedLines) return;

            let image = new Image();
            let matchedPath = matchPathName(path);

            const ext = Object.keys(file).find(ext => ext.match(IMAGE_EXTS_REGEX));
            if (segMasks && file.first_order && file.second_order) //Composite the segmasks together
                if (!file.seg_mask) 
                    imageThumb.sharpBlend(matchedPath[1] + sep + matchedPath[2] + ".first_order.png", matchedPath[1] + sep + matchedPath[2] + ".second_order.png", 'add') //https://libvips.github.io/libvips/API/current/libvips-conversion.html#VipsBlendMode
                        .then(output => {
                            updateFile(matchedPath[1], matchedPath[2], { seg_mask: output} ); //Cache the segmask in Redux so we don't composite every time
                            image.src = 'data:image/png;base64,' + output.toString('base64');
                        });
                else image.src = 'data:image/png;base64,' + file.seg_mask.toString('base64');
            
            else if (ext.includes('tif')) //Decode and render tiff to a canvas, which we draw to our main canvas
            {
                console.log("hi tif");
                let image = new Tiff({ buffer: readFileSync(matchedPath[1] + sep + matchedPath[2] + "." + ext) });
                // ctx.drawImage(image.toCanvas(), 0, 0);
                image.src = 'data:image/png;base64,' + image.readRGBAImage().toString('base64');
                if (architecture) this.drawRSML(ctx, simplifiedLines); 
                console.log(image.toDataURL())
            }
            else image.src = matchedPath[1] + sep + matchedPath[2] + "." + ext; //Otherwise we can just ref the file path normally

            image.onload = () => {
                console.log("Loaded")
                this.fabricCanvas.add(new fabric.Image(image, {
                    left: 0, top: 0, selectable: false
                }));
                //ctx.drawImage(image, 0, 0);
                if (architecture) this.drawRSML(ctx, simplifiedLines); //This needs to be called after each image draws, otherwise the loading may just draw it over the rsml due to async 
            };     
        }
    }

    drawRSML = (ctx, simplifiedLines) => {
        simplifiedLines.forEach(line => {   //Each sub-array is a line of point objects - [ line: [{}, {} ] ]
            console.log(line.points);
            let polyline = new fabric.Polyline(line.points, {
                stroke: line.type == 'primary' ? this.colours.PRIMARY : this.colours.LATERAL,
                fill: null,
                strokeWidth: 4,
                padding: 0
            });
            this.fabricCanvas.add(polyline);
        });
    }
    componentDidMount()
    {
        const canvas = this.canvas.current;
        const ctx = canvas.getContext("2d");
        canvas.width  = "2400";  //defaults to 300x150
        canvas.height = "2400"; //We'll need to upscale the DOM DPI, and then scale it down to fit the UI to get a high res canvas
        
        //Canvas settings
        ctx.strokeStyle = '#f53';
        ctx.lineWidth   = 4;
        ctx.lineCap     = ctx.lineJoin ='round';

        //ctx.scale(1 / this.canvasScaleDiv, 1 / this.canvasScaleDiv);
        this.draw();    
    }

    //Formats a plant into arrays of lines - all the polylines in the RSML, labelled by primary/lateral
    formatPoints = rsml => {
        const { attrNodeName, attributeNamePrefix } = this.xmlOptions;
        if (rsml.geometry) //If the node has geometry, extract it into an array of simplified points
        {
            // simplifiedLines: [ {type: "lat", points: [{x, y}] }]
            this.rsmlPoints.push(   //To test alts, change rootnavspline to polyline
                { type: rsml[attrNodeName][attributeNamePrefix + 'label'], //This structure may not be useful for plugins, so they might need to do organising of RSML themselves
                points: rsml.geometry.polyline.point.map(p => ({ 
                    x: p.attr[attributeNamePrefix + 'x'],             
                    y: p.attr[attributeNamePrefix + 'y']
                })) //Can also add a * 0.5 to scale the image points down, rather than scaling the canvas
            });
        }
        if (rsml.root)
        {
           Array.isArray(rsml.root) ? rsml.root.forEach(root => this.formatPoints(root)) : this.formatPoints(rsml.root); //XMl parsing results in this check being required here too
        }
    }

    FabricCanvas = () => {
        this.fabricCanvas = new fabric.Canvas('c');
        console.log(this.fabricCanvas)
        this.fabricCanvas.initialize(document.getElementById('c'), { width: 1000, height: 1000 }); //This is the element size, these may need tweaking, maybe on the fly later
        this.fabricCanvas.setDimensions({ width: 3000, height: 3000 }, { backstoreOnly: true }); //This is the height of the actual drawing canvas
        return <canvas id='c'></canvas>
    }

    render() 
    {   
        const { file, path, updateParsedRSML } = this.props;
        if (!file.parsedRSML && file.rsml)
        {
            let matchedPath = matchPathName(path);
            //Ingest the RSML here if it's not cached in state
            let data = readFileSync(matchedPath[1] + sep + matchedPath[2] + ".rsml", 'utf8');
            let rsmlJson = parser.parse(data, this.xmlOptions);
            const { scene: { plant } } = rsmlJson.rsml;
            //if the XML tag contains a single root/plant, it's an object, if it has multiple, it'll be an array of [0: {}, 1: {}, 2: {}, ...], hence the need for this check
            Array.isArray(plant) ? plant.forEach(plantItem => this.formatPoints(plantItem)) : this.formatPoints(plant);
            updateParsedRSML(matchedPath[1], matchedPath[2], {rsmlJson, simplifiedLines: this.rsmlPoints}); //Send it to state, with {JSONParsedXML, and simplifiedPoints}
            console.log(this.rsmlPoints.length);
            this.rsmlPoints = [];
        }

        return (
            <div>
                <this.FabricCanvas />
                <canvas ref={this.canvas} style={{width: '1200px', height: '1200px'}} />
            </div>
        );
    }
}

//parse the read RSML into an array of points, or several arrays of points, I guess lines for each primary and lateral else our line will be doing huge paths back and forth and fuck the metrics
            //simplify points

            /*
            rsml:
                scene: {}
                    plant: {}
                        root: []
                            0: {}
                                attr: {} @_label: primary
                                geometry: {}
                                    polyline: {}
                                        point: [{ attr: {@_x: 123, @_y: 456}, {attr: @_x: 123, @_y: 456} }]
                                    rootnavspline: I don't think we need splines
                                        point: [{}]
                                root: []
                                    0: {}
                                        attr: @_label "lat"
                                        geometry: {}
                                            spline/polyline:
                            1:
                            2:
                    plant:
                    plant:
            */