import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import './style.scss'
import axios from 'axios'
import qs from 'qs'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'


const FormItem = Form.Item

const mapStateToProps = ({ app }) => {
  const { url } = app
  return {
    url: url,
  }
}

@connect(mapStateToProps)
@Form.create()
class ForgotPass extends React.Component {
  static defaultProps = {}

  state = {
    sending: false,
  }

  onSubmit = (event) => {
    event.preventDefault()
    const { form, dispatch, url } = this.props

    form.validateFields((error, values) => {
      if (error) {
        return
      }

      this.setState({
        sending: true,
      })

      const postData = {
        email: values.email,
      }

      axios({
        method: 'post',
        url: url + '/auth/forgot',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify(postData)
      })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log(res.data.err)
          dispatch(push('/forgot/fail'))
          return false
        } else if (res.data.res === 'success'){
          dispatch(push('/forgot/success'))
          return true
        }
      })
      .catch(function (error) {
        console.log(error)
        dispatch(push('/forgot/fail'))
        return false
      })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form

    return (
      <div className="m-forgot m-forgot--fullscreen">
        <div className="m-forgot__header">
          <div className="row">
            <div className="col-lg-12">
              <div className="m-forgot__header__logo">
                <a >
                  <img src="resources/images/sparlay_logo_text.png" alt="Sparlay" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="m-forgot__block m-forgot__block--extended pb-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="m-forgot__block__inner">
                <div className="m-forgot__block__form">
                  <Form onSubmit={this.onSubmit} className="forgot-form">
                    <label>Enter email associated with</label>
                    <label>your account</label>
                    <br/>
                    <br/>
                    <br/>
                    <FormItem>
                      {getFieldDecorator('email', {
                        rules: [
                          { type: 'email', message: 'The input is not a valid email address' },
                          { required: true, message: 'Please input email!' }
                        ],
                      })(
                        <Input
                          className="m-forgot__input"
                          placeholder="Sparlayfan@example.com"
                        />,
                      )}
                    </FormItem>
                    <div className="m-forgot__form-actions">
                      <Button htmlType="submit" className="m-forgot__button col-12">
                        Continue
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ForgotPass
