import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Check from './Check'

class CheckPage extends React.Component {
  render() {
    const { match, ...props } = this.props
    return (
      <Page {...props}>
        <Helmet title="Check Member" />
        <Check match={match} />
      </Page>
    )
  }
}

export default CheckPage
