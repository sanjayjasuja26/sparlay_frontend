import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Terms from './Terms'

class TermsPage extends React.Component {
  static defaultProps = {
    pathName: 'Documentation',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Terms of Service and Subscription Agreement" />
        <Terms />
      </Page>
    )
  }
}

export default TermsPage
