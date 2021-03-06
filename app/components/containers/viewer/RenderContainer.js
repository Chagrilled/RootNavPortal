import { connect } from 'react-redux';
import Render from '../../viewer/Render';
import { updateFile } from '../../../actions/galleryActions'; //still in the gallery state since we're building on the file cache, owned by that reducer. :hmm:
import { matchPathName } from '../../../constants/globals';
import { pushEditStack } from '../../../actions/viewerActions';

const mapStateToProps = (state, ownProps) => {
    const { path, fileName }  = matchPathName(ownProps.path);
    let viewer =  state.viewer.viewers[process.pid];
    return { 
        path: ownProps.path,
        file: path && fileName ? state.gallery.files[path][fileName] : null,
        architecture:  viewer ? viewer.architecture : false, //These prevent errors when unloading the viewer, since the action updates children before the process actually ends
        segMasks: viewer ? viewer.segMasks : false,
        editStack: viewer ? viewer.editStack : false
    }
};

const mapDispatchToProps = dispatch => ({
    updateFile: (folder, fileName, newExts) => dispatch(updateFile(folder, fileName, newExts)),
    pushEditStack: lines => dispatch(pushEditStack(process.pid, lines))
});

export default connect(mapStateToProps, mapDispatchToProps)(Render)