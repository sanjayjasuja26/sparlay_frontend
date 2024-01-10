import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'

import './style.scss'


const FormItem = Form.Item

const mapStateToProps = ({ app }) => {
  const { url } = app
  return {
    url: url,
  }
}

@connect(mapStateToProps)
@Form.create()
class Check extends React.Component {
  static defaultProps = {}

  state = {
    sending: false,
  }

  onSubmit = (event) => {
    event.preventDefault()
    const { form, dispatch } = this.props

    form.validateFields((error, values) => {
      if (error) {
        return
      }
      if (values.password == '@7HY#Dle3zL!nCXY&d7H') {
        window.localStorage.setItem('sparlay.member', '1')
        dispatch(push('/main'))
      } else {
        window.localStorage.setItem('sparlay.member', '0')
        form.setFields({
          password: {
            errors: [new Error('Wrong Password!')],
          },
        })
      }
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
                <a>
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
                    <br/>
                    <label>Enter Memeber Password</label>
                    <br/>

                    <FormItem>
                      {getFieldDecorator('password', {
                        rules: [
                          { required: true, message: 'Required!' }
                        ],
                      })(
                        <Input
                          className="m-forgot__input"
                          prefix={<i className="fa fa-lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                          type="password"
                          placeholder="Password"
                          spellCheck="false"
                        />,
                      )}
                    </FormItem>
                    <br/>
                    <div className="m-forgot__form-actions">
                      <Button htmlType="submit" className="m-button col-12">
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

export default Check
