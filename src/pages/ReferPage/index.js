import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Refer from './Refer'

class ReferPage extends React.Component {
  static defaultProps = {
    pathName: 'Deposit',
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Refer" />
        <Refer />
      </Page>
    )
  }
}

export default ReferPage
