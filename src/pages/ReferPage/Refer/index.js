import React from 'react'
import { connect } from 'react-redux'
import { setDialogState } from 'ducks/app'
import './style.scss'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'

const InputGroup = Input.Group

const mapStateToProps = ({ app }) => {
  const { userState, siteState } = app
  return {
    userState: userState,
    referral: siteState.referral,
  }
}

@connect(mapStateToProps)
class Refer extends React.Component {

  copyLink = () => {
    var { dispatch , userState } = this.props
    if (userState.user_id === '') {
      dispatch(setDialogState({ referPrompt: true }))
      return
    }

    var textarea = document.createElement('textarea')
    textarea.value = this.props.referral
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('Copied!')
  }

  render() {
    return (
      <div className="m-refer">
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 col-md-12 no-padding">
            <div className="card">
              <div className="card-body">
                <img className="refer-img" src="resources/images/refer.png" alt=""/>
                <h1>SHARE YOUR</h1>
                <h1>LOVE OF SPARLAY!</h1>
                <h4>Share our referral link with your friends!</h4>
                <InputGroup compact className="link-group">
                  <Input size="large" className="sharelink" disabled={true}
                  value={this.props.referral} style={{height: '42px'}}/>
                  <Button className="m-button" style={{ width: '100px'}}
                  onClick={this.copyLink}
                  >
                    Copy Link
                  </Button>
                </InputGroup>
                <h5>Receive 100 Sparlay Tokens for each referral!</h5>
                <div className="icon-area">
                  <a href="https://www.facebook.com/playsparlay/" target="_blank" rel="noopener noreferrer">
                    <img className="link-icon" src="resources/images/facebook.png" alt=""/>
                  </a>
                  <a href="https://twitter.com/SparlayLLC" target="_blank" rel="noopener noreferrer">
                    <img className="link-icon" src="resources/images/twitter.png" alt=""/>
                  </a>
                  <a href="https://www.instagram.com/playsparlay/" target="_blank" rel="noopener noreferrer">
                    <img className="link-icon" src="resources/images/instergram.png" alt=""/>              
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Refer
