import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Policy from './Policy'

class PolicyPage extends React.Component {
  static defaultProps = {
    pathName: 'Policy',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Privacy Policy" />
        <Policy />
      </Page>
    )
  }
}

export default PolicyPage
