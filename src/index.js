import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { Helmet } from 'react-helmet'
import { composeWithDevTools } from 'redux-devtools-extension'
import { createBrowserHistory } from 'history'
import thunk from 'redux-thunk'
import 'es6-promise/auto'

import ConfigProvider from 'antd/lib/config-provider'
import enGB from 'antd/lib/locale-provider/en_GB'
import registerServiceWorker from 'registerServiceWorker'

import Layout from 'components/LayoutComponents/Layout'
import reducer from 'ducks'

import 'resources/_antd.less'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'resources/AntStyles/AntDesign/antd.cleanui.scss'
import 'resources/CleanStyles/Core/core.cleanui.scss'
import 'resources/CleanStyles/Vendors/vendors.cleanui.scss'

const history = createBrowserHistory();
const router = routerMiddleware(history);
const middlewares = [router, thunk];
const isLogger = false;
if (isLogger && process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger');
  middlewares.push(logger)
}
const store = createStore(reducer, composeWithDevTools(applyMiddleware(...middlewares)))

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ConfigProvider locale={enGB}>
        <div>
          <Helmet titleTemplate="Sparlay - %s" />
          <Layout />
        </div>
      </ConfigProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();

export default history
