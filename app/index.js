import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import Store from './store/configureStore';
import './bootstrap.global.css';
import './app.global.css';
import './fontawesome.global.css';
import { getInitialStateRenderer } from 'electron-redux';

const initialState = {gallery: { folders: [], modal: false, modalBody: [], hasReadConfig: false, checked: [], files: {}, filterText: "" }};

const { configureStore, history } = Store('renderer');
const store = configureStore(initialState, 'renderer');

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
