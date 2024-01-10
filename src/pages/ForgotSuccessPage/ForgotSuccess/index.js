import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { setDialogState } from 'ducks/app'
import './style.scss'

import Button from 'antd/lib/button'
import Form from 'antd/lib/form'

const mapStateToProps = ({ app }) => {
  const { url } = app
  return {
    url: url,
  }
}

@connect(mapStateToProps)
@Form.create()
class ForgotSuccess extends React.Component {
  static defaultProps = {}
  state = {}

  goLogin = () => {
    const { dispatch } = this.props
    dispatch(setDialogState({ login: true }))
    dispatch(push('/main'))
  }

  componentDidMount() {
    document.getElementsByTagName('body')[0].style.overflow = 'hidden'
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].style.overflow = ''
  }

  render() {

    return (
      <div className="m-fgsuccess m-fgsuccess--fullscreen">
        <div className="m-fgsuccess__header">
          <div className="row">
            <div className="col-lg-12">
              <div className="m-fgsuccess__header__logo">
                <a >
                  <img src="resources/images/sparlay_logo_text.png" alt="Sparlay" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="m-fgsuccess__block m-fgsuccess__block--extended pb-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="m-fgsuccess__block__inner">
                <div className="m-fgsuccess__block__form">
                  <br/>
                  <img src="/resources/images/forgot-success.png" alt="Thumbsup"></img>
                  <label style={{'fontSize' : '19px'}}>Thanks!</label>
                  <br/>
                  <br/>
                  <label>Your username/password has been</label>
                  <label>sent to your email address</label>
                  <div className="m-fgsuccess__form-actions">
                  <Button 
                    htmlType="button" 
                    className="m-fgsuccess__button col-12"
                    onClick={this.goLogin}
                  >
                    Go to the Login
                  </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ForgotSuccess
