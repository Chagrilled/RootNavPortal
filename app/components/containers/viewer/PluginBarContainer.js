import { connect } from 'react-redux';
import PluginBar from '../../viewer/PluginBar';

const mapStateToProps = (state, ownProps) => {
    let viewer =  state.viewer.viewers[process.pid];

    return {
        files: state.gallery.files,
        folders: viewer ? viewer.checked : []
    }
};

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PluginBar)