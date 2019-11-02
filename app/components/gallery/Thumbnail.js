// @flow
import React, { Component } from 'react';
import imageThumbail from 'image-thumbnail';
import { sep } from 'path';

type Props = {};

export default class Thumbnail extends Component<Props> {
  props: Props;

	shouldComponentUpdate(nextProps, nextState) 
	{
		return (JSON.stringify(nextProps.file) !== JSON.stringify(this.props.file));
	}

	render() {
        //folder - the full path to this folder - in state.gallery.folders
        //file - object that contains ext:bool KVs for this file - state.gallery.files[folder][fileName]
        //fileName - the full file name, no extension
        const { folder, file, fileName, addThumb } = this.props;
        if (["jpg", "png"].some(ext => ext in file && !(ext + "Thumb" in file))) {
            const ext = 'jpg' in file ? 'jpg' : 'png';
            imageThumbail(folder + sep + fileName + "." + ext).then(thumb => {
                addThumb(folder, fileName, {ext: ext, thumb}) //Bundle the thumbnail with the extension so we can label them pngThumb or similar accordingly in case there are multiple thumbs for a file name
            }).catch(err => console.error(err));
        }

		return (
            <div>
                {
                    (file.pngThumb) ? <img src={'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, file.pngThumb)) } /> :
                    (file.jpgThumb) ? <img src={'data:image/jpg;base64,' + btoa(String.fromCharCode.apply(null, file.jpgThumb)) } /> : 
                    ""
                }
            </div>
		);
	}
}
