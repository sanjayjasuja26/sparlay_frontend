import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Deposit from './Deposit'

class DepositPage extends React.Component {
  static defaultProps = {
    pathName: 'Deposit',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Deposit" />
        <Deposit />
      </Page>
    )
  }
}

export default DepositPage
