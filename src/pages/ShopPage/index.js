import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Shop from './Shop'

class ShopPage extends React.Component {
  static defaultProps = {
    pathName: 'Main',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="" />
        <Shop />
      </Page>
    )
  }
}

export default ShopPage
