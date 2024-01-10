import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import ForgotPass from './ForgotPass'

class ForgotPassPage extends React.Component {
  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Forgot Password" />
        <ForgotPass match={match} />
      </Page>
    )
  }
}

export default ForgotPassPage
