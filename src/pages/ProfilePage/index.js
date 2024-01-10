import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Profile from './Profile/index'
import { enquireScreen, unenquireScreen } from 'enquire-js'

let isMobile
enquireScreen(b => {
  isMobile = b
})

class ProfilePage extends React.Component {
  static defaultProps = {
    pathName: 'Profile',
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
        <Helmet title="My Account" />
        <Profile isMobile={this.state.isMobile} />
      </Page>
    )
  }
}

export default ProfilePage
