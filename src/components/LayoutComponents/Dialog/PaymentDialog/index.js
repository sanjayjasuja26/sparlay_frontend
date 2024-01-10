import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import axios from 'axios'
import qs from 'qs'
import { loadStripe } from '@stripe/stripe-js'
import { useStripe, useElements, Elements, CardElement } from '@stripe/react-stripe-js'
import { setDialogState, setUserState, setUserPayments, setSiteState } from 'ducks/app'
import { checkEmail } from 'siteGlobal/g'

import Modal from 'antd/lib/modal'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Checkbox from 'antd/lib/checkbox'
import Select from 'antd/lib/select'
import Radio from 'antd/lib/radio'
import Form from 'antd/lib/form'
import message from 'antd/lib/message'

import './style.scss'

const Url = require('url')
const stripePromise = loadStripe(
  'pk_test_51H1dVwD8AzjPQ1dwRgWplj6mdn5lgAPFcLCqMpiYJJOqxvsSSnpalz7DN4O4lp5KV22O3AFvJuQvcFt23QEmy9lz008l1F7Icc',
)
var stripe

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const mapStateToProps = ({ app }) => {
  const { userState, user_payments, dialogState, siteState, url } = app
  return {
    url: url,
    userState: userState,
    user_payments: user_payments,
    store: siteState.store,

    selectMethod: dialogState.selectMethod,
    selectPayment: dialogState.selectPayment,
    subscribePlan: dialogState.subscribePlan,
    paymentFlow: dialogState.paymentFlow,
    paymentAmount: dialogState.paymentAmount,
    paymentToken: dialogState.paymentToken,
    addCard: dialogState.addCard,
    addPaypal: dialogState.addPaypal,

    upgradeKey: dialogState.upgradeKey,
    upgradePlan: dialogState.upgradePlan,
  }
}

@connect(mapStateToProps)
@Form.create()
class PaymentDialog extends React.Component {
  state = {
    payment_method: 'paypal',
    payment_sCard: 'Choose Credit Card',
    payment_sPaypal: 'Choose PayPal Account',
    sPayment: {},

    card: {
      type: '',
      number: '',
      holder: '',
      exp: '',
      cvv: '',
      submitable: false,
    },

    paypal: '',
    cardErr: 'Invalid Card!',
  }

  //*************************** choose payment ***************************//

  onPaymentMethod = e => {
    this.setState({
      payment_method: e.target.value,
      payment_sCard: 'Choose Credit Card',
      payment_sPaypal: 'Choose PayPal Account',
      sPayment: {},
    })
  }

  onPaymentCard = v => {
    this.setState({
      payment_sCard: v,
      sPayment: this.props.user_payments[v],
    })
  }

  onPaymentPaypal = v => {
    this.setState({
      payment_sPaypal: v,
      sPayment: this.props.user_payments[v],
    })
  }

  choosePayment = () => {
    const { dispatch, paymentFlow } = this.props
    const { payment_method, sPayment } = this.state
    dispatch(setDialogState({ selectPayment: false }))
    if (paymentFlow == 'upgrade') {
      if (payment_method == 'card') {
        this.cancelSubsribe(() => {
          this.subscribeCard(sPayment)
        })
      } else {
        this.cancelSubsribe(() => {
          this.subscribePaypal(sPayment.email)
        })
      }
    } else if (paymentFlow == 'upgrade_limit') {
      if (payment_method == 'card') {
        this.uplimitCard(sPayment.id)
      } else {
        this.uplimitPaypal(sPayment.email)
      }
    } else if (paymentFlow == 'deposit') {
      if (payment_method == 'card') {
        this.depositCard(sPayment.id)
      } else {
        this.depositPaypal(sPayment.email)
      }
    } else if (paymentFlow == 'purchase') {
      if (payment_method == 'card') {
        this.purchaseCard(sPayment.id)
      } else {
        this.purchasePaypal(sPayment.email)
      }
    }
  }

  newPaypal = () => {
    this.setState({ payment_method: 'paypal' })

    const { dispatch } = this.props
    dispatch(setDialogState({ selectPayment: false, addPaypal: true }))
  }

  newCard = () => {
    this.setState({ payment_method: 'card' })

    const { dispatch } = this.props
    dispatch(setDialogState({ selectPayment: false, addCard: true }))
  }

  //*************************** select method ***********************//

  onMethodSelect = m => {
    this.setState({ payment_method: m })
  }

  selectMethod = () => {
    const { dispatch, paymentFlow } = this.props
    dispatch(setDialogState({ selectMethod: false }))
    if (paymentFlow == 'join') {
      if (this.state.payment_method == 'card') {
        dispatch(setDialogState({ addCard: true }))
      } else {
        this.subscribePaypal()
      }
    } else if (paymentFlow == 'add') {
      if (this.state.payment_method == 'card') {
        dispatch(setDialogState({ addCard: true }))
      } else {
        dispatch(setDialogState({ addPaypal: true }))
      }
    }
  }

  //**************************** paypal *****************************//

  subscribePaypal = (payer = '') => {
    const { dispatch } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Redirecting to Paypal ...',
      }),
    )

    let userPre = {}
    if (this.props.paymentFlow == 'join') {
      userPre = JSON.parse(window.localStorage.getItem('sparlay.user_pre'))
    } else {
      userPre = {
        email: this.props.userState.user_id,
        username: this.state.sPayment.id,
        vip: this.props.subscribePlan,
        password: '0',
        real_name: '0',
        addr: '0',
        city: '0',
        state: '0',
        zip: '0',
        phone: '0',
      }
    }

    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/subscribe',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        payer: payer,
        flow: this.props.paymentFlow,
        user: userPre,
        trial: this.props.userState.trial,
      }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          window.open(res.data.approval_url, '_self')
        } else if (res.data.res == 'fail') {
          console.log('***subscribePaypal >', res.data.err)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('Exception: subscribePaypal >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  uplimitPaypal = payer => {
    this.cancelUplimit()
    const { dispatch, upgradePlan, upgradeKey, userState } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Redirecting to Paypal ...',
      }),
    )

    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/uplimit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        payer: payer,
        vip: userState.vip,
        lim: upgradePlan,
        upgrade_key: upgradeKey,
      }),
    })
      .then(function(res) {
        if (res.data.res === 'success') {
          window.open(res.data.approval_url, '_self')
        } else if (res.data.res === 'fail') {
          message.error('Failed to Upgrade Limit!')
          console.log('***/PaymentDialog:uplimitPaypal >', err)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('???/PaymentDialog:uplimitPaypal >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  depositPaypal = payer => {
    const { dispatch } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Redirecting to Paypal ...',
      }),
    )

    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/deposit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: this.props.userState.user_id,
        payer: payer,
        amount: this.props.paymentAmount,
      }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          window.open(res.data.approval_url, '_self')
        } else if (res.data.res == 'fail') {
          console.log('***/Payment : deppositPaypal >', res.data.err)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('Exception /Payment : deppositPaypal >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  purchasePaypal = payer => {
    const { dispatch } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Redirecting to Paypal ...',
      }),
    )

    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/purchase',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: this.props.userState.user_id,
        payer: payer,
        amount: this.props.paymentAmount,
        spa_token: this.props.paymentToken,
      }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          window.open(res.data.approval_url, '_self')
        } else if (res.data.res == 'fail') {
          console.log('***/Payment : purchasePaypal >', res.data.err)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('Exception /Payment : purchasePaypal >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  cancelSubsribe = callback => {
    const { dispatch } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Cancelling Subscription ...',
      }),
    )

    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/membership/cancel',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id }),
    })
      .then(function(res) {
        if (res.data.res === 'success') {
          callback()
        } else {
          dispatch(setDialogState({ loading: false }))
          message.error('Failed to Cancel Previous Membership!')
          console.log('***/PaymentDialog:onCancelMembership >', err)
        }
      })
      .catch(function(error) {
        dispatch(setDialogState({ loading: false }))
        message.error('Failed to Cancel Previous Membership!')
        console.log('???/PaymentDialog:onCancelMembership >', error)
      })
  }

  cancelUplimit = () => {
    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/uplimit/cancel',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id }),
    })
      .then(function(res) {
        if (res.data.res === 'fail') {
          console.log('***/PaymentDialog:cancelUplimit >', res.data.err)
        }
      })
      .catch(function(error) {
        console.log('???/PaymentDialog:cancelUplimit >', error)
      })
  }

  //*************************** add paypal **************************//

  onPaypal = e => {
    this.setState({ paypal: e.target.value })
  }

  checkPaypalSubmittable = () => {
    let card = this.state.card
  }

  addPaypal = e => {
    e.preventDefault()

    const { form, dispatch } = this.props
    const _this = this

    form.validateFields(['new_paypal'], (error, values) => {
      if (error) return

      _this.setState({ sPayment: { id: '0', email: values.new_paypal } }, _this.choosePayment)
    })

    // dispatch(setDialogState({
    //   loading: true,
    //   loadingText: '',
    // }))
    //
    // const _this = this
    // axios({
    //   method: 'post',
    //   url: this.props.url + '/payment_paypal/add',
    //   headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    //   data: qs.stringify({
    //     user_id: userState.user_id,
    //     email: this.state.paypal
    //   })
    // })
    //   .then(function (res) {
    //     if (res.data.res == 'success') {
    //       _this.authCheck(userState.user_id, paymentFlow)
    //       dispatch(setDialogState({
    //         loading: false,
    //         addPaypal: false
    //       }))
    //     } else if (res.data.res == 'fail') {
    //       console.log('***/paymentDialog:addPaypal >', res.data.err)
    //       dispatch(setDialogState({ loading: false }))
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log('???/paymentDialog:addPaypal >', error)
    //     dispatch(setDialogState({ loading: false }))
    //   })
  }

  //**************************** card *******************************//

  subscribeCard = pm => {
    const { dispatch, paymentFlow } = this.props
    let pm1 = pm

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Subscribing ...',
      }),
    )

    let user = {}
    if (paymentFlow == 'join') {
      user = JSON.parse(window.localStorage.getItem('sparlay.user_pre'))
      pm1 = this.getCardPM(pm)
    } else {
      user = {
        user_id: this.props.userState.user_id,
        vip: this.props.subscribePlan,
      }
    }

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_stripe/subscribe',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user: user,
        flow: paymentFlow,
        pm: pm1,
        trial: this.props.userState.trial,
      }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          _this.authCheck(res.data.user_id, paymentFlow)
          dispatch(
            setDialogState({
              loading: false,
              addCard: false,
            }),
          )
        } else if (res.data.res == 'fail') {
          console.log('***/paymentDialog:subscribeCard >', res.data.message)
          _this.setState({ cardErr: res.data.message })
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('Exception:/paymentDialog:subscribeCard >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  uplimitCard = pm_id => {
    this.cancelUplimit()
    const { dispatch, upgradePlan, upgradeKey, userState } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: 'Subscribing ...',
      }),
    )

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_stripe/uplimit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        pm_id: pm_id,
        vip: userState.vip,
        lim: upgradePlan,
        upgrade_key: upgradeKey,
      }),
    })
      .then(function(res) {
        dispatch(setDialogState({ loading: false }))
        if (res.data.res === 'success') {
          _this.authCheck(userState.user_id, 'Upgrade Max Limit')
        } else if (res.data.res == 'fail') {
          // message.error('Failed to Upgrade Limit!')
          console.log('***/PaymentDialog:uplimitCard >', res.data.message)
          _this.setState({ cardErr: res.data.message })
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        dispatch(setDialogState({ loading: false }))
        console.log('???/PaymentDialog:uplimitCard >', error)
      })
  }

  depositCard = pm_id => {
    const { dispatch, userState } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: '',
      }),
    )

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_stripe/deposit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        pm_id: pm_id,
        amount: this.props.paymentAmount,
      }),
    })
      .then(function(res) {
        dispatch(setDialogState({ loading: false }))
        if (res.data.res == 'success') {
          _this.authCheck(userState.user_id, 'Deposit')
        } else if (res.data.res == 'fail') {
          console.log('***/PaymentDialog : deppositCard >', res.data.message)
          _this.setState({ cardErr: res.data.message })
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('???/PaymentDialog : deppositCard >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  purchaseCard = pm_id => {
    const { dispatch, userState } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: '',
      }),
    )

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_stripe/purchase',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        pm_id: pm_id,
        amount: this.props.paymentAmount,
        spa_token: this.props.paymentToken,
      }),
    })
      .then(function(res) {
        dispatch(setDialogState({ loading: false }))
        if (res.data.res == 'success') {
          _this.authCheck(userState.user_id, 'Purchase Tokens')
        } else if (res.data.res == 'fail') {
          console.log('***/PaymentDialog : purchaseCard >', res.data.message)
          _this.setState({ cardErr: res.data.message })
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('???/PaymentDialog : purchaseCard >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  //**************************** add card ***************************//

  onAddCard = cardElements => {
    const { dispatch, paymentFlow } = this.props
    // this.props.dispatch(setDialogState({ addCard: false }))

    const _this = this
    stripe
      .createPaymentMethod({
        type: 'card',
        card: cardElements,
      })
      .then(result => {
        if (result.error) {
          console.log(result.error)
        } else {
          if (paymentFlow == 'join') {
            _this.subscribeCard(result.paymentMethod)
          } else {
            _this.addCard(result.paymentMethod)
          }
        }
      })
  }

  getCardPM = pm => {
    let exp_month = pm.card.exp_month
    let exp_year = pm.card.exp_year + ''
    if (parseInt(exp_month) < 10) exp_month = '0' + exp_month

    let paymentMethod = {
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      exp_month: exp_month,
      exp_year: exp_year.substring(2),
    }

    return paymentMethod
  }

  addCard = pm => {
    const { dispatch, userState } = this.props

    dispatch(
      setDialogState({
        loading: true,
        loadingText: '',
      }),
    )

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_stripe/add',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        pm: this.getCardPM(pm),
      }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          _this.setState({ sPayment: res.data.new_pm }, _this.choosePayment)
          dispatch(
            setDialogState({
              addCard: false,
            }),
          )
          // _this.authCheck(userState.user_id, 'add')
        } else if (res.data.res == 'fail') {
          console.log('***/paymentDialog:addCard >', res.data.message)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function(error) {
        console.log('???/paymentDialog:addCard >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  //**************************** component **************************//

  authCheck = (user_id, type = '') => {
    const { dispatch } = this.props
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/check',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: user_id }),
    })
      .then(res => {
        if (res.data.res == 'success') {
          let userData = res.data.user_data
          if (userData.status == 'suspended') {
            dispatch(setDialogState({ suspendPrompt: true }))
            return
          }
          if (userData.status == 'pending') {
            dispatch(setDialogState({ pendingPrompt: true }))
            return
          }

          if (type != '') {
            if (type == 'add') {
              // message.success('Your payment method was successfully added!')
            } else if (type == 'subscribe') {
              message.success('Welcome to Sparlay!')
            } else if (type == 'deposit') {
              message.success('Your Deposit was Successful!')
            } else {
              message.success('Succeeded to ' + type + '!')
            }

            let store = JSON.parse(window.localStorage.getItem('sparlay.userStore'))
            if (!store) {
              store = { page: '', data: {} }
            }
            console.log(store)
            dispatch(setSiteState({ store: store }))
            window.localStorage.setItem('sparlay.userStore', JSON.stringify({ page: '', data: {} }))

            if (store.page != '') {
              dispatch(push(store.page))
            }
          }
          dispatch(setUserState({ userState: userData }))
          dispatch(setUserPayments(res.data.user_payments))
          dispatch(
            setSiteState({ referral: 'https://playsparlay.com/main?referral=' + userData.user_id }),
          )
        }
      })
      .catch(err => {
        console.log('Exception: authCheck', err)
      })
  }

  componentDidMount() {
    const { dispatch } = this.props
    let self_url = window.location.href

    let userData = JSON.parse(window.localStorage.getItem('sparlay.userData'))
    if (!userData) {
      userData = {
        user_id: '',
        username: '',
        email: '',
        cash: '0',
        token: '0',
        vip: '1',
        lim: '1',
        trial: '0',
        status: '',
      }
      window.localStorage.setItem('sparlay.userData', JSON.stringify(userData))
      dispatch(setUserState({ userState: userData }))
      dispatch(setSiteState({ referral: '' }))

      let referral = Url.parse(self_url, true).query.referral
      if (referral != '' && referral != undefined) {
        window.localStorage.setItem('sparlay.referral', referral)
        dispatch(setDialogState({ join: true }))
      }
      return
    }
    dispatch(setUserState({ userState: userData }))

    let membership = Url.parse(self_url, true).query.membership
    if (membership == 'subscribe') {
      let user_id = Url.parse(self_url, true).query.user
      this.authCheck(user_id, 'subscribe')
    } else if (membership == 'upgrade') {
      this.authCheck(userData.user_id, 'Upgrade Membership')
    } else if (membership == 'upgrade_limit') {
      this.authCheck(userData.user_id, 'Upgrade Max Limit')
    } else if (membership == 'deposit') {
      this.authCheck(userData.user_id, 'deposit')
    } else if (membership == 'purchase') {
      this.authCheck(userData.user_id, 'Purchase Tokens')
    } else {
      this.authCheck(userData.user_id)
    }
  }

  //**************************** render *****************************//

  render() {
    const { getFieldDecorator } = this.props.form
    const { isMobile, dispatch } = this.props
    const CARD_ELEMENT_OPTIONS = {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    }

    return (
      <div className="dialogs-payment">
        {/*********************** choose payment ******************/}

        <Modal
          className="select-payment spa-modal"
          visible={this.props.selectPayment}
          onCancel={() => {
            dispatch(setDialogState({ selectPayment: false }))
          }}
        >
          <div className="header">
            <h3>Choose Payment</h3>
          </div>

          <div className="detail">
            <div className="row">
              <RadioGroup
                value={this.state.payment_method}
                className="select"
                onChange={this.onPaymentMethod}
              >
                <RadioButton value="paypal" className="item">
                  <div className="img-paypal">
                    <img src="resources/images/paypal.png" alt="" />
                  </div>
                </RadioButton>
                <RadioButton value="card" className="item">
                  <div>
                    <span>Credit Card</span>
                  </div>
                </RadioButton>
              </RadioGroup>
            </div>

            {this.state.payment_method == 'card' ? (
              <div>
                <Select
                  className="text-capitalize"
                  size={'large'}
                  style={{ width: '100%' }}
                  value={this.state.payment_sCard}
                  onChange={this.onPaymentCard}
                >
                  {this.props.user_payments.map((payment, index) => {
                    if (payment.method == 'card') {
                      return (
                        <Option className="text-capitalize" value={index} key={payment.id}>
                          {payment.brand} .....{payment.number} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          {payment.exp}
                        </Option>
                      )
                    }
                  })}
                </Select>
                <h6 className="text-center">
                  <a className="new_payment" onClick={this.newCard}>
                    New Credit Card
                  </a>
                </h6>
              </div>
            ) : (
              <div>
                <Select
                  size={'large'}
                  style={{ width: '100%' }}
                  value={this.state.payment_sPaypal}
                  onChange={this.onPaymentPaypal}
                >
                  {this.props.user_payments.map((payment, index) => {
                    if (payment.method == 'paypal') {
                      return (
                        <Option value={index} key={payment.id}>
                          {payment.email}
                        </Option>
                      )
                    }
                  })}
                </Select>
                <h6 className="text-center">
                  <a className="new_payment" onClick={this.newPaypal}>
                    New Paypal
                  </a>
                </h6>
              </div>
            )}
          </div>

          <div className="foot">
            <Button className="m-button" onClick={this.choosePayment}>
              {' '}
              Continue{' '}
            </Button>
          </div>
        </Modal>

        {/*********************** select method ********************/}

        <Modal
          className="set-payment spa-modal"
          visible={this.props.selectMethod}
          // onCancel={() => { dispatch(setDialogState({ selectMethod: false })) }}
          closable={false}
        >
          <div className="header">
            <h3>Choose Payment Method</h3>
          </div>

          <div className="detail">
            <div className={isMobile ? 'check_area-m' : 'check_area'}>
              <Checkbox
                onChange={this.onMethodSelect.bind(this, 'paypal')}
                checked={this.state.payment_method == 'paypal'}
              >
                PayPal
              </Checkbox>
              <br />
              <Checkbox
                onChange={this.onMethodSelect.bind(this, 'card')}
                checked={this.state.payment_method == 'card'}
              >
                Credit Card
              </Checkbox>
            </div>

            <br />
            {this.props.paymentFlow == 'join' ? (
              <div>
                <p>
                  You will be auto-billed after 7 days of Free trial. You can cancel or upgrade your
                  plan at any time from your profile page.
                </p>
                <br />
                <p>A PURCHASE WILL NOT IMPROVE YOUR CHANCES OF WINNING.</p>
                <p>
                  Must be 21 years of age or older to join Sparlay and play. All prize claims are
                  subject to verification. Restrictions apply. See our Terms of Service for
                  additional eligibility restrictions. VOID WHERE PROHIBITED BY LAW.
                </p>
              </div>
            ) : null}

            <a
              className="back"
              onClick={() => {
                dispatch(setDialogState({ selectMethod: false, add_addr: true }))
              }}
            >
              &lt; Back
            </a>
            <div className="row">
              <Button
                className={isMobile ? 'black-button mobile-button' : 'black-button desktop-button'}
                onClick={this.selectMethod}
              >
                Continue
              </Button>
            </div>
          </div>
        </Modal>

        {/*********************** add card ***********************/}

        <Modal
          className="add-card spa-modal"
          visible={this.props.addCard}
          onCancel={() => {
            dispatch(setDialogState({ addCard: false }))
          }}
        >
          <div className="header">
            <h3>Add Credit Card</h3>
          </div>

          <Elements stripe={stripePromise}>
            <StripeForm
              addCard={this.onAddCard}
              msg={this.state.cardErr}
              change={() => {
                this.setState({ cardErr: '' })
              }}
            />
          </Elements>
        </Modal>

        {/*********************** add paypal *********************/}

        <Modal
          className="add-paypal spa-modal"
          visible={this.props.addPaypal}
          onCancel={() => {
            dispatch(setDialogState({ addPaypal: false }))
          }}
        >
          <div className="header">
            <h3>Add Paypal</h3>
          </div>

          <Form
            onSubmit={this.addPaypal}
            className="detail"
            style={{ marginBottom: '0', paddingBottom: '0' }}
          >
            <FormItem className="field">
              {getFieldDecorator('new_paypal', {
                initialValue: '',
                rules: [
                  {
                    type: 'email',
                    message: 'The input is not valid Email!',
                  },
                  {
                    required: true,
                    message: 'required!',
                  },
                ],
              })(<Input placeholder="your_paypal@email.com" spellCheck="false" />)}
            </FormItem>

            <div className="foot">
              <Button htmlType="submit" className="m-button" style={{ marginTop: '20px' }}>
                {' '}
                Continue{' '}
              </Button>
            </div>
          </Form>
          {/*<div className="detail">*/}
          {/*<div className="field">*/}
          {/*<Input size="large" placeholder="your_paypal@email.com"*/}
          {/*value={this.state.paypal} onChange={this.onPaypal} spellCheck={false}/>*/}
          {/*</div>*/}
          {/*</div>*/}
        </Modal>
      </div>
    )
  }
}

function StripeForm(props) {
  stripe = useStripe()
  const elements = useElements()
  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }

  return (
    <div>
      <div className="detail">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={() => {
            props.change()
          }}
        />
        <p>{props.msg}</p>
      </div>

      <div className="foot">
        <Button
          className="m-button"
          disabled={!stripe}
          onClick={() => {
            props.addCard(elements.getElement(CardElement))
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default PaymentDialog
