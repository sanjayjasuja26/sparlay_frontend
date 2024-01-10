import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import Script from 'react-load-script'
import axios from 'axios'
import qs from 'qs'
import PaymentDialog from './PaymentDialog'
import CommonDialog from './CommonDialog'
import { setDialogState, setUserState, setSiteState, setUserPayments } from 'ducks/app'
import { years, months, dates, checkEmail, invalidLocation } from 'siteGlobal/g'

import Modal from 'antd/lib/modal'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
import Radio from 'antd/lib/radio'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import message from 'antd/lib/message'

import './style.scss'

const FormItem = Form.Item
const Option = Select.Option

const mapStateToProps = ({ app }) => {
  const { userState, dialogState, url, plans_vip } = app
  return {
    url: url,
    userState: userState,
    plans_vip: plans_vip,

    login: dialogState.login,
    join: dialogState.join,
    verify: dialogState.verify,
    joinInput: dialogState.joinInput,
    add_addr: dialogState.add_addr,
    upgradeVIP: dialogState.upgradeVIP,
  }
}

@connect(mapStateToProps)
@Form.create()
class Dialog extends React.Component {
  constructor(props) {
    super(props)
    this.autocomplete = null
  }

  state = {
    plan_index: 0,

    check_email: false,
    check_username: false,
    check_pass1: false,
    check_pass2: false,
    check_pass3: false,
    check_confirm: false,
    month: '',
    year: '',
    date: '',
    agree_policy: false,
    agree_age: false,
    agree_location: false,
    submitDisabled: true,

    v_email: '',
    v_username: '',
    v_password: '',
    v_code: '',
  }

  //****************************** Login ******************************//

  login = e => {
    e.preventDefault()

    const { form, dispatch } = this.props
    form.validateFields(['login_username', 'login_password', 'login_remember'], (error, values) => {
      if (error) return

      axios({
        method: 'post',
        url: this.props.url + '/auth/login',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
          username: values.login_username,
          password: values.login_password,
        }),
      })
        .then(res => {
          if (res.data.res == 'success') {
            dispatch(setDialogState({ login: false }))

            let userData = res.data.user_data
            if (values.login_remember) {
              window.localStorage.setItem('sparlay.login_username', userData.username)
              form.setFieldsValue({ login_password: '' })
            } else {
              window.localStorage.setItem('sparlay.login_username', '')
              form.setFieldsValue({ login_username: '', login_password: '' })
            }

            if (userData.status == 'suspended') {
              dispatch(setDialogState({ suspendPrompt: true }))
              return
            }

            if (userData.status == 'pending') {
              dispatch(setDialogState({ pendingPrompt: true }))
              return
            }

            message.success('Succeeded to Login!')
            dispatch(setUserState({ userState: userData }))
            dispatch(setUserPayments(res.data.user_payments))
            dispatch(
              setSiteState({
                referral: 'https://playsparlay.com/main?referral=' + userData.user_id,
              }),
            )
            dispatch(push('/main'))
          } else if (res.data.res == 'fail') {
            if (res.data.err == 'username') {
              form.setFields({
                login_username: {
                  value: values.username,
                  errors: [new Error('Invalid username!')],
                },
              })
              return false
            } else if (res.data.err == 'password') {
              form.setFields({
                login_password: {
                  value: values.password,
                  errors: [new Error('Wrong Password!')],
                },
              })
              return false
            }
          }
        })
        .catch(err => {
          console.log('Exception: login', err)
        })
    })
  }

  forgot = () => {
    this.props.dispatch(setDialogState({ login: false }))
    this.props.dispatch(push('/forgot-pass'))
  }

  //****************************** Join VIP **********************//

  onJoinPlan = plan => {
    if (plan > 0) {
      if (invalidLocation()) {
        this.props.dispatch(setDialogState({ locationPrompt: true }))
        return
      }
    }

    const { dispatch, form } = this.props

    this.setState({
      plan_index: plan,
      check_email: false,
      check_username: false,
      check_pass1: false,
      check_pass2: false,
      check_pass3: false,
      check_confirm: false,
      month: '',
      year: '',
      date: '',
      agree_policy: false,
      agree_age: false,
      agree_location: false,
      submitDisabled: true,
    })

    form.setFieldsValue({
      email: '',
      username: '',
      password: '',
      confirm: '',
    })

    dispatch(
      setDialogState({
        join: false,
        joinInput: true,
        paymentFlow: 'join',
        subscribePlan: plan + 1,
      }),
    )
  }

  //****************************** Upgrade VIP ****************************//

  onUpgradePlan = plan => {
    if (invalidLocation()) {
      this.props.dispatch(setDialogState({ locationPrompt: true }))
      return
    }

    this.props.dispatch(
      setDialogState({
        upgradeVIP: false,
        paymentFlow: 'upgrade',
        subscribePlan: plan + 1,
        selectPayment: true,
      }),
    )
  }

  //****************************** Join Input *****************************//

  onJoinInputInput = (field, e) => {
    const { form } = this.props
    const values = form.getFieldsValue()

    if (field == 'email') {
      if (checkEmail(e.target.value)) {
        form.setFields({
          email: { validateStatus: 'success' },
        })
        this.setState({ check_email: true }, this.checkJoinInputSubmittable)
      } else {
        form.setFields({
          email: { errors: [new Error('Invalid email address!')] },
        })
        this.setState({ check_email: false, submitDisabled: true })
      }
    }

    if (field == 'username') {
      if (e.target.value.length > 20) {
        form.setFields({
          username: { errors: [new Error('Username must be less than 20 characters!')] },
        })
        this.setState({ check_username: false, submitDisabled: true })
      } else {
        form.setFields({
          username: { validateStatus: 'success' },
        })
        this.setState({ check_username: true }, this.checkJoinInputSubmittable)
      }
    }

    if (field == 'password') {
      const password = e.target.value

      this.setState({ check_confirm: false, submitDisabled: true })

      if (password.length > 7) {
        this.setState({
          check_pass1: true,
        })
      } else {
        this.setState({
          check_pass1: false,
          submitDisabled: true,
        })
      }

      if (/[A-Z]/.test(password)) {
        this.setState({
          check_pass2: true,
        })
      } else {
        this.setState({
          check_pass2: false,
          submitDisabled: true,
        })
      }

      var matches = password.match(/\d+/g)
      if (matches != null) {
        this.setState({
          check_pass3: true,
        })
      } else {
        this.setState({
          check_pass3: false,
          submitDisabled: true,
        })
      }

      form.setFields({
        confirm: { validateStatus: 'success' },
      })
    }

    if (field == 'confirm') {
      if (values.password == e.target.value) {
        form.setFields({
          confirm: { validateStatus: 'success' },
        })
        this.setState({ check_confirm: true }, this.checkJoinInputSubmittable)
      } else {
        form.setFields({
          confirm: { errors: [new Error('Passwords do not match!')] },
        })
        this.setState({ check_confirm: false, submitDisabled: true })
      }
    }
  }

  onJoinInputSelect = (field, e) => {
    if (field == 'month') this.setState({ month: e }, this.checkJoinInputSubmittable)
    else if (field == 'date') this.setState({ date: e }, this.checkJoinInputSubmittable)
    else if (field == 'year') this.setState({ year: e }, this.checkJoinInputSubmittable)
  }

  onCheck = (field, e) => {
    if (field == 'policy')
      this.setState({ agree_policy: e.target.checked }, this.checkJoinInputSubmittable)
    else if (field == 'age')
      this.setState({ agree_age: e.target.checked }, this.checkJoinInputSubmittable)
    else if (field == 'location')
      this.setState({ agree_location: e.target.checked }, this.checkJoinInputSubmittable)
  }

  checkJoinInputSubmittable = () => {
    var valid = true

    valid = valid && this.state.check_email
    valid = valid && this.state.check_username
    valid = valid && this.state.check_pass1
    valid = valid && this.state.check_pass2
    valid = valid && this.state.check_pass3
    valid = valid && this.state.check_confirm
    valid = valid && this.state.month != ''
    valid = valid && this.state.date != ''
    valid = valid && this.state.year != ''
    valid = valid && this.state.agree_policy
    valid = valid && this.state.agree_age
    valid = valid && this.state.agree_location

    if (valid) this.setState({ submitDisabled: false })
    else this.setState({ submitDisabled: true })
  }

  joinInput = e => {
    e.preventDefault()

    const { form, dispatch } = this.props
    const values = form.getFieldsValue()
    const _this = this

    dispatch(
      setDialogState({
        loading: true,
        loadingText: '',
      }),
    )

    axios({
      method: 'post',
      url: this.props.url + '/auth/join/check',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ email: values.email, username: values.username }),
    })
      .then(function(res) {
        dispatch(setDialogState({ loading: false }))

        if (res.data.res == 'success') {
          dispatch(setDialogState({ add_addr: true, joinInput: false }))
          _this.setState({
            v_email: values.email,
            v_username: values.username,
            v_password: values.password,
            v_code: '',
          })
          _this.autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById('addr'),
            {},
          )
          _this.autocomplete.addListener('place_changed', _this.mailingSelect)
        } else {
          if (res.data.err == 'email') {
            form.setFields({
              email: {
                value: values.email,
                errors: [new Error('Registered already!')],
              },
            })
          } else if (res.data.err == 'username') {
            form.setFields({
              username: {
                value: values.username,
                errors: [new Error('Registered already!')],
              },
            })
          }
        }
      })
      .catch(function(error) {
        dispatch(setDialogState({ loading: false }))
        console.log('Exception: joinInput', error)
      })
  }

  //****************************** address *******************************//

  addAddress = e => {
    e.preventDefault()

    const { form, dispatch } = this.props
    const _this = this
    form.validateFields(
      ['firstname', 'lastname', 'addr', 'city', 'state', 'zip', 'phone'],
      (error, values) => {
        if (error) return

        let userPre = {
          vip: _this.state.plan_index + 1,
          email: _this.state.v_email,
          username: _this.state.v_username,
          password: _this.state.v_password,
          real_name: values.firstname + ' ' + values.lastname,
          addr: values.addr,
          city: values.city,
          state: values.state,
          zip: values.zip,
          phone: values.phone,
        }
        window.localStorage.setItem('sparlay.user_pre', JSON.stringify(userPre))

        form.setFields({
          v_code: {
            value: '',
            validateStatus: 'success',
          },
        })

        dispatch(setDialogState({ verify: true, add_addr: false }))
      },
    )
  }

  createAccount = () => {
    const { form, dispatch } = this.props
    const values = form.getFieldsValue()
    const _this = this

    dispatch(
      setDialogState({
        loading: true,
        loadingText: '',
      }),
    )

    let postData = JSON.parse(window.localStorage.getItem('sparlay.user_pre'))
    axios({
      method: 'post',
      url: this.props.url + '/auth/join/create',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(postData),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          dispatch(
            setDialogState({
              joinInput: false,
              loading: false,
            }),
          )

          let userData = res.data.user_data

          dispatch(
            setSiteState({ referral: 'https://playsparlay.com/main?referral=' + userData.user_id }),
          )
          dispatch(setUserState({ userState: userData }))
          dispatch(setUserPayments(res.data.user_payments))
          dispatch(push('/main'))
          message.success('Welcome to Sparlay!')
        } else {
          dispatch(
            setDialogState({
              joinInput: false,
              loading: false,
            }),
          )
          message.error('Failed to Join!')
          console.log('*** createAccount', res.data)
        }
      })
      .catch(function(error) {
        dispatch(
          setDialogState({
            joinInput: false,
            loading: false,
          }),
        )
        message.error('Failed to Join!')
        console.log('Exception: createAccount', error)
      })
  }

  mailingSelect = () => {
    let addressObject = this.autocomplete.getPlace()
    let address = addressObject.address_components

    // console.log(address)
    let auto_address = { city: '' }
    for (let i = 0; i < address.length; i++) {
      switch (address[i].types[0]) {
        case 'street_number':
          var street_number = address[i].short_name
          break
        case 'route':
          var route = address[i].long_name
          break
        case 'subpremise':
          auto_address.second = address[i].short_name
          break
        case 'sublocality_level_1':
          var city = address[i].short_name
          break
        case 'locality':
          auto_address.city = address[i].short_name
          break
        case 'administrative_area_level_1':
          auto_address.state = address[i].short_name
          break
        case 'country':
          auto_address.country = address[i].short_name
          break
        case 'postal_code':
          auto_address.zip = address[i].short_name
          break
        default:
          break
      }
    }
    auto_address.addr = street_number + ' ' + route
    if (auto_address.city == '') {
      auto_address.city = city
    }

    const { form } = this.props

    form.setFieldsValue({
      addr: auto_address.addr,
      city: auto_address.city,
      state: auto_address.state,
      zip: auto_address.zip,
    })
  }

  scriptLoaded = () => {
    // this.autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('addr'), {})
    // this.autocomplete.addListener("place_changed", this.mailingSelect)
  }

  //****************************** verify ********************************//

  getCode = () => {
    const { form, dispatch } = this.props
    const values = form.getFieldsValue()
    form.setFields({
      v_code: {
        value: '',
        validateStatus: 'success',
      },
    })

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/join/verify',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ email: this.state.v_email }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          message.success('We sent a 6-digit code to your email!')
          _this.setState({
            v_code: res.data.v_code,
          })
        }
      })
      .catch(function(error) {
        console.log('???/Dialog: getCode >', error)
      })
  }

  verify = e => {
    e.preventDefault()

    if (this.state.v_code == '') {
      return
    }

    const { form, dispatch } = this.props
    const values = form.getFieldsValue()

    if (values.v_code == this.state.v_code) {
      message.success('Email Verified!')
      if (this.state.plan_index > 0) {
        dispatch(
          setDialogState({
            verify: false,
            selectMethod: true,
          }),
        )
      } else {
        this.createAccount()
      }
    } else {
      form.setFields({
        v_code: {
          value: values.v_code,
          errors: [new Error('Wrong Code!')],
        },
      })
    }
  }

  //****************************** component *******************************//

  componentDidMount() {}

  //****************************** render ***********************************//

  render() {
    const { getFieldDecorator } = this.props.form
    const { isMobile, dispatch, userState } = this.props

    return (
      <div className="dialogs-auth">
        <Script
          url="https://maps.googleapis.com/maps/api/js?key=AIzaSyAqZCe5_pC6wh092ZR0FHGY5rCnoTSupOM&libraries=places"
          onLoad={this.scriptLoaded}
        />

        {/*********************** login **********************/}

        <Modal
          className="login spa-modal"
          visible={this.props.login}
          onCancel={() => {
            dispatch(setDialogState({ login: false }))
          }}
        >
          <Form onSubmit={this.login} className="login-form">
            <FormItem>
              <label className="form-label mb-0">Username</label>
              {getFieldDecorator('login_username', {
                initialValue: window.localStorage.getItem('sparlay.login_username'),
                rules: [{ required: true, message: 'required!' }],
              })(
                <Input
                  prefix={<i className="fa fa-user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Sparlayfan"
                  spellCheck="false"
                />,
              )}
            </FormItem>
            <FormItem>
              <label className="form-label mb-0">Password</label>
              {getFieldDecorator('login_password', {
                rules: [{ required: true, message: 'required!' }],
              })(
                <Input
                  prefix={<i className="fa fa-lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="Password"
                  spellCheck="false"
                />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('login_remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(<Checkbox>Remember Username</Checkbox>)}

              {!isMobile ? (
                <a className="login-form-forgot pull-right text-primary" onClick={this.forgot}>
                  Forgot Username/Password?
                </a>
              ) : null}
            </FormItem>

            <div>
              <Button htmlType="submit" className="black-button col-12">
                Login
              </Button>
            </div>

            {isMobile ? (
              <FormItem style={{ marginBottom: '0', marginTop: '10px' }}>
                <a className="login-form-forgot pull-right text-primary" onClick={this.forgot}>
                  Forgot Username/Password?
                </a>
              </FormItem>
            ) : null}
          </Form>
        </Modal>

        {/*********************** join vip *******************/}

        <Modal
          className="join-plan spa-modal"
          visible={this.props.join}
          onCancel={() => {
            dispatch(setDialogState({ join: false }))
          }}
        >
          <div className={isMobile ? 'header-m' : 'header'}>
            <h3>WELCOME TO SPARLAY!</h3>
            <p>
              Sparlay is a peer-to-peer sports betting platform. Users are able to create and accept
              bets with other users, and can even alter the odds. For a full description on how the
              platform works, watch this quick video: <a>"How to Play on Sparlay"</a>
            </p>
            <p>We offer a number of affordable subscriptions for all sports betters.</p>
            <p>* You may cancel paid subscription at any time.</p>
          </div>

          {isMobile ? (
            <div className="row section-area-m">
              {this.props.plans_vip.map((plan, index) => (
                <Col className={plan.best == '1' ? 'section best' : 'section'} key={index}>
                  <h4>{plan.name}</h4>
                  <h4>{index > 0 ? '$' + plan.cost : plan.cost}</h4>
                  <p style={{ fontWeight: '600' }}>&nbsp;{plan.trial}</p>
                  <p>&nbsp;{plan.over}</p>
                  {plan.best == '1' ? <img src="resources/images/ribon.png" alt="" /> : null}
                  <Button
                    className={plan.best == '1' ? 'y-button' : 'm-button'}
                    onClick={this.onJoinPlan.bind(this, index)}
                  >
                    {index == 0 ? 'Register' : ''}
                    {index == 1 ? 'Purchase' : ''}
                    {index > 1 ? 'Subscribe' : ''}
                  </Button>
                </Col>
              ))}
            </div>
          ) : (
            <div className="row section-area">
              {this.props.plans_vip.map((plan, index) => (
                <Col className={plan.best == '1' ? 'section best' : 'section'} key={index}>
                  <h4>{plan.name}</h4>
                  <h4>{index > 0 ? '$' + plan.cost : plan.cost}</h4>
                  <p style={{ fontWeight: '600' }}>&nbsp;{plan.trial}</p>
                  <p>&nbsp;{plan.over}</p>
                  {plan.best == '1' ? <img src="resources/images/ribon.png" alt="" /> : null}
                  <Button
                    className={plan.best == '1' ? 'y-button' : 'm-button'}
                    onClick={this.onJoinPlan.bind(this, index)}
                  >
                    {index == 0 ? 'Register' : ''}
                    {index == 1 ? 'Purchase' : ''}
                    {index > 1 ? 'Subscribe' : ''}
                  </Button>
                </Col>
              ))}
            </div>
          )}

          <p className={isMobile ? 'des-m' : 'des'}>
            *With a Sparlay Basic Membership, users are unable to deposit real funds, nor are they
            able to create OR accept bets with real funds. Users will still have the opportunity to
            win money, however.*
          </p>
          <p className="foot">
            Already have an account?
            <Button
              className="m-button"
              onClick={() => {
                dispatch(setDialogState({ join: false, login: true }))
              }}
            >
              Login
            </Button>
          </p>
        </Modal>

        {/*********************** join input *****************/}

        <Modal
          className={isMobile ? 'join-input join-input-m' : 'join-input'}
          visible={this.props.joinInput}
        >
          <Form onSubmit={this.joinInput}>
            <FormItem className="col-md-7">
              {getFieldDecorator(
                'email',
                {},
              )(
                <Input
                  prefix={<i className="fa fa-envelope" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Email"
                  spellCheck="false"
                  onChange={this.onJoinInputInput.bind(this, 'email')}
                />,
              )}
            </FormItem>

            <FormItem className="col-md-7">
              {getFieldDecorator(
                'username',
                {},
              )(
                <Input
                  prefix={<i className="fa fa-user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Username"
                  spellCheck="false"
                  onChange={this.onJoinInputInput.bind(this, 'username')}
                />,
              )}
            </FormItem>

            <div className="row">
              <FormItem className="col-md-7">
                {getFieldDecorator(
                  'password',
                  {},
                )(
                  <Input
                    prefix={<i className="fa fa-lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="password"
                    placeholder="Password"
                    onChange={this.onJoinInputInput.bind(this, 'password')}
                    spellCheck="false"
                  />,
                )}
              </FormItem>
              <div
                className={
                  isMobile ? 'validate_area-m validate_area col-md-5' : 'validate_area col-md-5'
                }
              >
                <Checkbox checked={this.state.check_pass1} disabled={true}>
                  At least 8 characters
                </Checkbox>
                <Checkbox checked={this.state.check_pass2} disabled={true}>
                  One uppercase
                </Checkbox>
                <Checkbox checked={this.state.check_pass3} disabled={true}>
                  One number
                </Checkbox>
              </div>
            </div>

            <FormItem className="col-md-7">
              {getFieldDecorator(
                'confirm',
                {},
              )(
                <Input
                  prefix={<i className="fa fa-lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="Confirm Password"
                  spellCheck="false"
                  onChange={this.onJoinInputInput.bind(this, 'confirm')}
                />,
              )}
            </FormItem>

            <label className="form-label mb-0">Date of Birth</label>
            <div className="row">
              <FormItem className={isMobile ? 'col-4' : 'col-3'}>
                {getFieldDecorator(
                  'month',
                  {},
                )(
                  <Select
                    size="large"
                    placeholder="Month"
                    onSelect={this.onJoinInputSelect.bind(this, 'month')}
                  >
                    {months.map((month, index) => (
                      <Option key={index} value={month}>
                        {month}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem className={isMobile ? 'col-4' : 'col-2'}>
                {getFieldDecorator(
                  'date',
                  {},
                )(
                  <Select
                    size="large"
                    placeholder="Date"
                    className="date"
                    onSelect={this.onJoinInputSelect.bind(this, 'date')}
                  >
                    {dates.map((date, index) => (
                      <Option key={index} value={date}>
                        {date}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <FormItem className={isMobile ? 'col-4' : 'col-2'}>
                {getFieldDecorator(
                  'year',
                  {},
                )(
                  <Select
                    size="large"
                    placeholder="Year"
                    onSelect={this.onJoinInputSelect.bind(this, 'year')}
                  >
                    {years.map((year, index) => (
                      <Option key={index} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
            </div>

            <div className="check_area">
              <Checkbox
                checked={this.state.agree_policy}
                onChange={this.onCheck.bind(this, 'policy')}
              >
                I agree to Sparlay's
              </Checkbox>
              <a href="/privacy" target="_blank">
                Privacy Policy.
              </a>
              <Checkbox
                className="agree-age"
                checked={this.state.agree_age}
                onChange={this.onCheck.bind(this, 'age')}
              >
                By creating an account I represent that I am 21 years of age or older.
              </Checkbox>
              <Checkbox
                className="agree-age"
                style={{ marginTop: '5px' }}
                checked={this.state.agree_location}
                onChange={this.onCheck.bind(this, 'location')}
              >
                By selecting a Sparlay VIP Membership, I represent that I reside one of the
                following states: CO, IN, IA, MS, NH, NJ, OR, PA, RI, WV.
              </Checkbox>
            </div>

            <a
              className="back"
              onClick={() => {
                dispatch(setDialogState({ join: true, joinInput: false }))
              }}
            >
              &lt; Back
            </a>
            <Button
              htmlType="submit"
              className={isMobile ? 'black-button mobile-button' : 'black-button desktop-button'}
              disabled={this.state.submitDisabled}
            >
              Continue
            </Button>
          </Form>
        </Modal>

        {/*********************** address ********************/}

        <Modal
          className="add-addr spa-modal"
          visible={this.props.add_addr}
          onCancel={() => {
            this.setState({ add_addr: false })
          }}
        >
          <div className="header">
            <h3>Add Contact Information</h3>
          </div>

          <div className="detail">
            <Form className="addr-form" onSubmit={this.addAddress}>
              <div className="row">
                <FormItem className="col-6" style={{ paddingLeft: '0', paddingRight: '6px' }}>
                  <label className="form-label mb-0">First Name</label>
                  {getFieldDecorator('firstname', {
                    rules: [{ required: true, message: 'required!' }],
                  })(<Input placeholder="Real Name" spellCheck="false" />)}
                </FormItem>
                <FormItem className="col-6" style={{ paddingRight: '0', paddingLeft: '6px' }}>
                  <label className="form-label mb-0">Last Name</label>
                  {getFieldDecorator('lastname', {
                    rules: [{ required: true, message: 'required!' }],
                  })(<Input placeholder="Real Name" spellCheck="false" />)}
                </FormItem>
              </div>
              <FormItem>
                <label className="form-label mb-0">Phone Number</label>
                {getFieldDecorator('phone', {
                  rules: [{ required: true, message: 'required!' }],
                })(<Input placeholder="Phone" spellCheck="false" />)}
              </FormItem>
              <FormItem>
                <label className="form-label mb-0">Address</label>
                {getFieldDecorator('addr', {
                  rules: [{ required: true, message: 'required!' }],
                })(<Input placeholder="Address" spellCheck="false" />)}
              </FormItem>
              <div className="row">
                <FormItem className="col-6" style={{ paddingLeft: '0', paddingRight: '12px' }}>
                  <label className="form-label mb-0">City</label>
                  {getFieldDecorator('city', {
                    rules: [{ required: true, message: 'required!' }],
                  })(<Input placeholder="City" spellCheck="false" />)}
                </FormItem>
                <FormItem className="col-3" style={{ paddingLeft: '0', paddingRight: '12px' }}>
                  <label className="form-label mb-0">State</label>
                  {getFieldDecorator('state', {
                    rules: [{ required: true, message: 'required!' }],
                  })(<Input placeholder="State" spellCheck="false" />)}
                </FormItem>
                <FormItem className="col-3" style={{ paddingLeft: '0', paddingRight: '0' }}>
                  <label className="form-label mb-0">Zip Code</label>
                  {getFieldDecorator('zip', {
                    rules: [{ required: true, message: 'required!' }],
                  })(<Input placeholder="Zip" spellCheck="false" />)}
                </FormItem>
              </div>
              <br />

              <a
                className="back"
                onClick={() => {
                  dispatch(setDialogState({ joinInput: true, add_addr: false }))
                }}
              >
                &lt; Back
              </a>
              <div className="row buttons">
                <Button
                  htmlType="submit"
                  className={
                    isMobile ? 'black-button mobile-button' : 'black-button desktop-button'
                  }
                >
                  Continue
                </Button>
              </div>
            </Form>
          </div>
        </Modal>

        {/*********************** verify *********************/}

        <Modal className="verify spa-modal" visible={this.props.verify}>
          <div className="header">
            <h3>Confirm your email</h3>
          </div>

          <Form onSubmit={this.verify} className="login-form">
            <FormItem>
              {getFieldDecorator('v_code', {
                initialValue: '',
                rules: [{ required: true, message: 'Input Code!' }],
              })(<Input placeholder="6 digit code" spellCheck="false" />)}
            </FormItem>

            <h5 className="text-center" style={{ marginTop: '10px' }}>
              <a className="get-code" onClick={this.getCode}>
                SEND VERIFICATION CODE
              </a>
            </h5>

            <a
              className="back"
              onClick={() => {
                dispatch(setDialogState({ add_addr: true, verify: false }))
              }}
            >
              &lt; Back
            </a>
            <div className="row buttons">
              <Button htmlType="submit" className="m-button">
                Start Playing!
              </Button>
            </div>
          </Form>
        </Modal>

        {/*********************** upgrade plan ****************/}

        <Modal
          className="upgrade-vip spa-modal"
          visible={this.props.upgradeVIP}
          onCancel={() => {
            dispatch(setDialogState({ upgradeVIP: false }))
          }}
        >
          <div className="header">
            <h3>UPGRADE SPARLAY VIP MEMBERSHIP!</h3>
            <p>* You may cancel paid subscription at any time.</p>
          </div>

          <div className="row section-area">
            {this.props.plans_vip.map((plan, index) => (
              <Col
                className={
                  index < 1 ? 'section_free' : plan.best == '1' ? 'section best' : 'section'
                }
                key={index}
              >
                {userState.vip == (index + 1).toString() ? (
                  <p className="current">Current</p>
                ) : null}
                <h4>{plan.name}</h4>
                <h4>${plan.cost}</h4>
                {userState.trial == '0' ? (
                  <p style={{ fontWeight: '600' }}>&nbsp;{plan.trial}</p>
                ) : null}
                <p>&nbsp;{plan.over}</p>
                {plan.best == '1' ? <img src="resources/images/ribon.png" alt="" /> : null}
                <Button
                  className={plan.best == '1' ? 'y-button' : 'm-button'}
                  onClick={this.onUpgradePlan.bind(this, index)}
                  disabled={userState.vip == (index + 1).toString()}
                >
                  Subscribe
                </Button>
              </Col>
            ))}
          </div>
        </Modal>

        <PaymentDialog isMobile={isMobile} />

        <CommonDialog isMobile={isMobile} />
      </div>
    )
  }
}

export default Dialog
