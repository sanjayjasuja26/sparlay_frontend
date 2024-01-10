import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Contest from './Contest'
import { enquireScreen, unenquireScreen } from 'enquire-js'

let isMobile
enquireScreen(b => {
  isMobile = b
})

class ContestPage extends React.Component {
  static defaultProps = {
    pathName: 'Contest',
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
        <Helmet title="Contests" />
        <Contest isMobile={this.state.isMobile} />
      </Page>
    )
  }
}

export default ContestPage
