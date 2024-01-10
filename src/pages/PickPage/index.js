import React from 'react'
import Page from 'components/LayoutComponents/Page'
import Helmet from 'react-helmet'
import Pick from './Pick'
import { enquireScreen, unenquireScreen } from 'enquire-js'

let isMobile
enquireScreen(b => {
  isMobile = b
})

class PickPage extends React.Component {
  static defaultProps = {
    pathName: 'Pick',
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
        <Helmet title="Enter Contest" />
        <Pick isMobile={this.state.isMobile} />
      </Page>
    )
  }
}

export default PickPage
