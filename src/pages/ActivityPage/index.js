import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Activity from './Activity'
import { enquireScreen, unenquireScreen } from 'enquire-js'

let isMobile
enquireScreen(b => {
  isMobile = b
})

class ActivityPage extends React.Component {
  static defaultProps = {
    pathName: 'Activity',
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
        <Helmet title="Betting Activity" />
        <Activity isMobile={this.state.isMobile} />
      </Page>
    )
  }
}

export default ActivityPage
