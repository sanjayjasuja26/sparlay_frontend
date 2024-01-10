import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Withdraw from './Withdraw'

class WithdrawPage extends React.Component {
  static defaultProps = {
    pathName: 'Withdraw',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Withdraw" />
        <Withdraw />
      </Page>
    )
  }
}

export default WithdrawPage
