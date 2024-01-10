import React from 'react'
import { connect } from 'react-redux'
import { Switch, Route } from 'react-router-dom'
import Loadable from 'react-loadable'
import Page from 'components/LayoutComponents/Page'

const addLocation = connect(state => ({
  location: state.routing.location,
}))
const ConnectedSwitch = addLocation(({ location, ...props }) => <Switch {...props} />)

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null,
  })

const HomePage = loadable(() => import('pages/DefaultPages/HomePage'))
const NotFoundPage = loadable(() => import('pages/DefaultPages/NotFoundPage'))

const loadableRoutes = {
  // Auth Pages
  '/forgot-pass': {
    component: loadable(() => import('pages/ForgotPassPage')),
  },
  '/forgot/success': {
    component: loadable(() => import('pages/ForgotSuccessPage')),
  },
  '/forgot/fail': {
    component: loadable(() => import('pages/ForgotFailPage')),
  },
  '/check': {
    component: loadable(() => import('pages/CheckPage')),
  },

  // Pages
  '/main': {
    component: loadable(() => import('pages/MainPage')),
  },
  '/create': {
    component: loadable(() => import('pages/CreateBetPage')),
  },
  '/open': {
    component: loadable(() => import('pages/OpenPage')),
  },
  '/challenge': {
    component: loadable(() => import('pages/ChallengePage')),
  },
  '/activity': {
    component: loadable(() => import('pages/ActivityPage')),
  },
  '/refer': {
    component: loadable(() => import('pages/ReferPage')),
  },

  '/lobby': {
    component: loadable(() => import('pages/LobbyPage')),
  },
  '/contest': {
    component: loadable(() => import('pages/ContestPage')),
  },
  '/pick': {
    component: loadable(() => import('pages/PickPage')),
  },

  '/account': {
    component: loadable(() => import('pages/ProfilePage')),
  },

  '/deposit': {
    component: loadable(() => import('pages/DepositPage')),
  },
  '/uplimit': {
    component: loadable(() => import('pages/UplimitPage')),
  },
  '/purchase': {
    component: loadable(() => import('pages/PurchasePage')),
  },
  '/withdraw': {
    component: loadable(() => import('pages/WithdrawPage')),
  },

  '/terms': {
    component: loadable(() => import('pages/TermsPage')),
  },
  '/privacy': {
    component: loadable(() => import('pages/PolicyPage')),
  },

  '/shop': {
    component: loadable(() => import('pages/ShopPage')),
  },
}

class Routes extends React.Component {
  render() {
    return (
      <ConnectedSwitch>
        <Route exact path="/" component={HomePage} />
        {Object.keys(loadableRoutes).map(path => {
          const { exact, ...props } = loadableRoutes[path]
          props.exact = exact === void 0 || exact || false
          return <Route key={path} path={path} {...props} />
        })}
        <Route
          render={() => (
            <Page>
              <NotFoundPage />
            </Page>
          )}
        />
      </ConnectedSwitch>
    )
  }
}

export { loadableRoutes }
export default Routes
