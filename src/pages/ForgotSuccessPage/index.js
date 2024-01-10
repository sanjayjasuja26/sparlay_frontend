import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import ForgotSuccess from './ForgotSuccess'

class ForgotSuccessPage extends React.Component {
  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Recovery Success" />
        <ForgotSuccess match={match} />
      </Page>
    )
  }
}

export default ForgotSuccessPage
