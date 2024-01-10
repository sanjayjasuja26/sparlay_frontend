import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import ForgotFail from './ForgotFail'

class ForgotFailPage extends React.Component {
  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Forgot Password" />
        <ForgotFail match={match} />
      </Page>
    )
  }
}

export default ForgotFailPage
