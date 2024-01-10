import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link } from "react-router-dom"
import axios from 'axios'
import qs from 'qs'
import { setDialogState, setUserState, setSiteState } from 'ducks/app'
import { sparlayToken, copyLink } from 'siteGlobal/g'

import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Spin from 'antd/lib/spin'
import Icon from 'antd/lib/icon'
import message from 'antd/lib/message'

import './style.scss'

const InputGroup = Input.Group

const mapStateToProps = ({ app }) => {
  const { siteState, dialogState, userState, url } = app
  return {
    url: url,
    userState: userState,
    referral: siteState.referral,

    loginPrompt: dialogState.loginPrompt,
    cashPrompt: dialogState.cashPrompt,
    tokenPrompt: dialogState.tokenPrompt,
    tokenContestPrompt: dialogState.tokenContestPrompt,
    membershipPrompt: dialogState.membershipPrompt,
    limitPrompt: dialogState.limitPrompt,
    blockPrompt: dialogState.blockPrompt,
    suspendPrompt: dialogState.suspendPrompt,
    pendingPrompt: dialogState.pendingPrompt,
    locationPrompt: dialogState.locationPrompt,
    loading: dialogState.loading,
    loadingText: dialogState.loadingText,
  }
}

@connect(mapStateToProps)
class CommonDialog extends React.Component {

  state = {
  }

  //************************ prompt login *********************//

  loginPromptOK = () => {
    this.props.dispatch(setDialogState({
      login: true,
      loginPrompt: false
    }))
  }

  loginPromptCancel = () => {
    this.props.dispatch(setDialogState({ loginPrompt: false}))
  }


  // *********************** prompt cash **********************//

  cashPromptOk = () => {
    this.props.dispatch(setDialogState({ cashPrompt: false, msg: 'cash' }))
  }

  cashPromptCancel = () => {
    this.props.dispatch(setDialogState({ cashPrompt: false, msg: '' }))
  }


  // *********************** prompt cash **********************//

  tokenPromptOk = () => {
    this.props.dispatch(setDialogState({ tokenPrompt: false, msg: 'token' }))
  }

  tokenPromptCancel = () => {
    this.props.dispatch(setDialogState({ tokenPrompt: false, msg: '' }))
  }


  //*********************** prompt token contest **************//

  tokenContestPromptCancel = () => {
    this.props.dispatch(setDialogState({ tokenContestPrompt: false }))
  }

  copyReferral = () => {
    copyLink(this.props.referral)
    message.success('Copied!')
  }


  //*********************** prompt membership *****************//

  membershipPromptOK = () => {
    this.props.dispatch(setDialogState({
      membershipPrompt: false,
      paymentFlow: 'upgrade',
      joinSelectPlan: true,
      msg: 'membership'
    }))
  }

  membershipPromptCancel = () => {
    this.props.dispatch(setDialogState({ membershipPrompt: false, msg: '' }))
  }


  //*********************** prompt limit *****************//

  limitPromptOk = () => {
    this.props.dispatch(setDialogState({
      limitPrompt: false,
      msg: 'uplimit'
    }))
  }

  limitPromptCancel = () => {
    this.props.dispatch(setDialogState({ limitPrompt: false, msg: '' }))
  }


  //*********************** prompt suspend ********************//

  suspendPromptCancel = () => {
    this.props.dispatch(setDialogState({ suspendPrompt: false }))
  }


  //*********************** prompt location ********************//

  locationPromptCancel = () => {
    this.props.dispatch(setDialogState({ locationPrompt: false }))
  }


  //*********************** pending ***************************//

  resend = () => {
    const postData = { user_id: this.props.userState.user_id }

    axios({
      method: 'post',
      url: this.props.url + '/auth/register/resend',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify(postData)
    })
    .then(function (res) {
      if (res.data.res === 'success'){
        console.log('Succeeded to resend')
      } else {
        console.log('*** CommonDialog:resend', res.data.err)
      }
    })
    .catch(function (err) {
      console.log('*** CommonDialog:resend', err)
    })
  }

  pendingCancel = () => {
    this.props.dispatch(setDialogState({ pendingPrompt: false }))
  }


//************************* component *************************//

  componentDidMount() {

  }


//*************************** render **************************//

  render() {
    const { isMobile } = this.props

    return (
      <div className="dialogs-common">

        {/*********** prompt login ************/}

        <Modal
          className="prompt-login"
          visible={this.props.loginPrompt}
          title="You must login to play!"
          onOk={this.loginPromptOK}
          onCancel={this.loginPromptCancel}
          footer={[
            <Button className="cancel" onClick={this.loginPromptCancel}>
              Cancel
            </Button>,
            <Button className="ok" onClick={this.loginPromptOK}>
              OK
            </Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">Please login to enjoy Sparlay.</label>
          </div>
        </Modal>


        {/*********** prompt cash *************/}

        <Modal
          className="prompt-cash"
          visible={this.props.cashPrompt}
          title="Not enough Sparlay Funds to play."
          onOk={this.cashPromptOk}
          onCancel={this.cashPromptCancel}
          footer={[
            <Button key="1" className="cancel" onClick={this.cashPromptCancel}>Cancel</Button>,
            <Button key="2" className="ok" onClick={this.cashPromptOk}>OK</Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">Please deposit funds to keep playing.</label>
          </div>
        </Modal>


        {/*********** token cash *************/}

        <Modal
          className="prompt-cash"
          visible={this.props.tokenPrompt}
          title="Not enough Sparlay Tokens to play."
          onOk={this.tokenPromptOk}
          onCancel={this.tokenPromptCancel}
          footer={[
            <Button key="1" className="cancel" onClick={this.tokenPromptCancel}>Cancel</Button>,
            <Button key="2" className="ok" onClick={this.tokenPromptOk}>OK</Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">Please purchase enough tokens to keep playing.</label>
          </div>
        </Modal>


        {/*********** prompt token contest ************/}

        <Modal
          className="prompt-token"
          visible={this.props.tokenContestPrompt}
          title=""
          onCancel={this.tokenContestPromptCancel}
          footer={[]}
        >
          <h3>Sorry!</h3>
          <p className="describe">You don't have the required number of Sparlay Tokens to enter this contest.</p>
          <p className="describe">
            Please return to the <Link to="/lobby">Lobby</Link> page
            to choose a different contest OR use your unique referral link below
            to revenue up to an additional {sparlayToken()}2,000.
          </p>

          <InputGroup compact className="link-group col-12">
            <Input size="large" className="sharelink" disabled={true}
                   value={this.props.referral} style={{height: '45px'}} />
            <Button className="m-button" style={{width: '100px'}}
                    onClick={this.copyReferral}
            >
              Copy Link
            </Button>
          </InputGroup>

          <p className="describe">Receive 100 Sparlay Tokens for each referral!</p>
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
        </Modal>


        {/*********** prompt suspend **********/}

        <Modal
          className="prompt-suspend"
          visible={this.props.suspendPrompt}
          title="Account Suspended"
          onCancel={this.suspendPromptCancel}
          footer={[]}
        >
          <div className="field">
            <label className="field__title">Your account has been suspended.
              You will be notified if/when the account is active again.
              Suspended accounts are not eligible for any cash prize(s).
            </label>
          </div>
        </Modal>


        {/*********** membership prompt ***********/}

        <Modal
          className="prompt-membership"
          visible={this.props.membershipPrompt}
          title=""
          onCancel={this.membershipPromptCancel}
          footer={[]}
        >
          <h3>Sorry!</h3>
          <p className="describe">This contest feature is only available for our VIP members.</p>
          <p className="describe">To subscribe for a Free one week trial of our VIP membership
            , click <a onClick={this.membershipPromptOK}>here</a>.</p>

          <h4>VIP Member Benefits</h4>
          <p>• Exclusive Written Contest</p>
          <p>• Contests</p>
          <p>• Customer Support Access</p>
          <p>• Game Simulator</p>
          <p>• Sparlay Data</p>
        </Modal>


        {/*********** token cash *************/}

        <Modal
          className="prompt-cash"
          visible={this.props.limitPrompt}
          title="Limit to deposit."
          onOk={this.limitPromptOk}
          onCancel={this.limitPromptCancel}
          footer={[
            <Button key="1" className="cancel" onClick={this.limitPromptCancel}>Cancel</Button>,
            <Button key="2" className="ok" onClick={this.limitPromptOk}>OK</Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">We're sorry! With your current subscription, you are unable to deposit more than $1000. Please Upgrade Your Limits, or try depositing a smaller amount.</label>
          </div>
        </Modal>


        {/*********** prompt pending ***********/}

        <Modal
          className="prompt-pending"
          title="Account Verification"
          visible={this.props.pendingPrompt}
          onCancel={this.pendingCancel}
        >
          <h4>We have sent you an email.</h4>
          <br/>
          <p>Please verify your email to activate account.</p>

          <Button className="yellow-button" onClick={this.resend}>
            Resend
          </Button>
        </Modal>


        {/*********** prompt location **********/}

        <Modal
          className="prompt-suspend"
          visible={this.props.locationPrompt}
          title="Restricted Location"
          onCancel={this.locationPromptCancel}
          footer={[]}
        >
          <div className="field">
            <label className="field__title">
              You can't wager with real funds in your location.
            </label>
          </div>
        </Modal>


        {/*********** redirect ***********/}

        <Modal
          className="sparlay-loading"
          visible={this.props.loading}
          footer={[]}
          zIndex={9000}
        >
          <div className="field">
            <Spin indicator={<Icon type="loading" style={{ fontSize: 48 }} spin />} />
          </div>
          <div className="field">
            <label>{this.props.loadingText}</label>
          </div>
        </Modal>

      </div>
    )
  }
}

export default CommonDialog
