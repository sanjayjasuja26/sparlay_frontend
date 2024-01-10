import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Challenge from './Challenge'
import { enquireScreen, unenquireScreen } from 'enquire-js'

let isMobile
enquireScreen(b => {
  isMobile = b
})

class ChallengePage extends React.Component {
  static defaultProps = {
    pathName: 'Challenge',
  }

  state = {
    isMobile
  }

  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      })
    })
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler)
  }

  render() {
    const props = this.props
    return (
      <Page {...props}>
        <Helmet title="Open Bets" />
        <Challenge isMobile={this.state.isMobile} />
      </Page>
    )
  }
}

export default ChallengePage
