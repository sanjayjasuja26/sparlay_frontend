import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Purchase from './Purchase'

class PurchasePage extends React.Component {
  static defaultProps = {
    pathName: 'Deposit',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Purchase Token" />
        <Purchase />
      </Page>
    )
  }
}

export default PurchasePage
