import { OPEN_DIR, REFRESH_DIRS, REMOVE_DIR} from '../actions/galleryActions';

export default (state = {folders: []}, action) => {
    switch (action.type)
    {
        case OPEN_DIR: return {
            ...state,
            folders: state.folders.concat(action.paths)
        };
        case REFRESH_DIRS: return state;
        case REMOVE_DIR: return {
            ...state,
            folders: state.folders.filter(path => path != action.path)
        };
        default: return state;
    }
}
