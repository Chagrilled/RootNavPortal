// @flow
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory, createMemoryHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '../reducers';
import type { counterStateType } from '../reducers/types';
import { electronEnhancer } from 'redux-electron-store';

let history;

function configureStore(initialState?: counterStateType, scope) {
    const history     = scope == 'main' ? createMemoryHistory() : createHashHistory();
    const rootReducer = createRootReducer(history);
    const router      = routerMiddleware(history);
    const middleware  = [thunk, router];

    const enhancer = compose(applyMiddleware(...middleware), electronEnhancer({ dispatchProxy: a => store.dispatch(a)})); 
    const store    = createStore(rootReducer, initialState, enhancer); //Don't shorten this. It can be one lined, yes, but ^this^ requires the variable hoisting from const to work, else it's undefined
    return store;
}

export default process => { 
    history = process == 'main' ? createMemoryHistory() : createHashHistory(); 
    return {configureStore, history}
};