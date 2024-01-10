import React from 'react'
import axios from 'axios'
import qs from 'qs'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { setDialogState , setUserState} from 'ducks/app'
import { formatNumber, getDateTime } from 'siteGlobal/g'

import Table from 'antd/lib/table'
import Form from 'antd/lib/form'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Divider from 'antd/lib/divider'
import Radio from 'antd/lib/radio'
import Select from 'antd/lib/select'
import Modal from 'antd/lib/modal'
import Result from 'antd/lib/result'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import message from 'antd/lib/message'

import './style.scss'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option

const mapStateToProps = ({ app }) => {
  const { userState, url, user_payments } = app
  return {
    url: url,
    userState: userState,
    user_payments: user_payments,
  }
}


@connect(mapStateToProps)
@Form.create()
class Withdraw extends React.Component {

  state = {
    amount: '',
    payment_method: 'paypal',
    payment_sCard: 'Choose Credit Card',
    payment_sPaypal: 'Choose PayPal Account',
    sPayment: {
      id: '0'
    },
    address: '',

    sortedInfo: {},
    submits: [],

    submit: {
      id: '15',
      confirm: 'd354988d6r467he456f434980',
      method: 'paypal',
      details: 'mypaypal@email.com',
      utc: '1593459091695',
      amount: '5',
      status: 'pending'
    },

    detail: false,
    intial: false
  }


  //************************** Method ***********************//

  onFund = (e) => {
    this.setState({ amount: e.target.value })
    this.props.form.setFields({
      amount: { validateStatus: 'success'}
    })
  }

  onPaymentMethod = (e) => {
    this.setState({
      payment_method: e.target.value,
      payment_sCard: 'Choose Credit Card',
      payment_sPaypal: 'Choose PayPal Account',
      sPayment: {
        id: '0'
      }
    })
  }

  onPaymentCard = (v) => {
    this.setState({
      payment_sCard: v,
      sPayment: this.props.user_payments[v]
    })
  }

  onPaymentPaypal = (v) => {
    this.setState({
      payment_sPaypal: v,
      sPayment: this.props.user_payments[v]
    })
  }

  withdraw = (e) => {
    const { form, dispatch, userState } = this.props
    const { amount, sPayment, address, payment_method } = this.state

    if (payment_method == 'paypal') {
      if (parseFloat(amount) < 1) {
        form.setFields({
          amount: {
            value: amount,
            errors: [new Error('Must be greater than Minimum Withdrawal!')]
          }
        })
        return
      }
    } else if (payment_method == 'check') {
      if (parseFloat(amount) < 15) {
        form.setFields({
          amount: {
            value: amount,
            errors: [new Error('Must be greater than Minimum Withdrawal!')]
          }
        })
        return
      }
    } else {
      return
    }

    if (parseFloat(amount) > parseFloat(userState.cash)) {
      form.setFields({
        amount: {
          value: amount,
          errors: [new Error('Must be less than Available Withdrawal!')]
        }
      })
      return
    }

    let details = ''
    if (payment_method == 'check') {
      details = address.real_name + ' .....' + address.phone
    } else {
      details = sPayment.email
    }

    dispatch(setDialogState({
      loading: true,
      loadingText: 'Requesting ...',
    }))

    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/transaction/withdraw/submit',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        method: payment_method,
        amount: amount,
        details: details,
        p_id: sPayment.id
      })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          userState.cash = res.data.cash
          dispatch(setUserState({userState: userState}))
          form.setFields({
            amount: { value: '' }
          })

          _this.setState({
            amount: '',
            payment_sCard: 'Choose Credit Card',
            payment_sPaypal: 'Choose PayPal Account',
            sPayment: {
              id: '0'
            },
            submits: res.data.submits,
            submit: res.data.submits[0]
          }, () => {
            dispatch(setDialogState({ loading: false }))
            _this.setState({detail: true})
          })
        }
      })
      .catch(function (error) {
        console.log('Exception/withdraw : submit', error)
      })
  }

  cancelSubmit = (submit) => {
    const { dispatch, userState } = this.props

    dispatch(setDialogState({
      loading: true,
      loadingText: 'Requesting ...',
    }))

    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/transaction/withdraw/cancel',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        w_id: submit.id
      })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          userState.cash = res.data.cash
          dispatch(setUserState({userState: userState}))

          dispatch(setDialogState({ loading: false }))
          _this.setState({
            submits: res.data.submits
          })
          message.success('Succeeded to Cancel Withdrawl')
        }
      })
      .catch(function (error) {
        console.log('Exception/withdraw : cancel', error)
      })
  }


  //************************* Transactions ******************//

  sortTable = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  showDetail = (submit) => {
    this.setState({
      submit: submit,
      detail: true
    })
  }

  onHideDetail = () => {
    this.setState({detail: false})
  }


  //************************* Component *********************//

  getAddress = () => {
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/address/get',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          _this.setState({address: res.data.address})
        }
      })
      .catch(function (e) {
        console.log('?: Fetch Address')
        console.log(e)
      })
  }

  addAddress = () => {
    const { dispatch } = this.props
    dispatch(push('/account'))
  }

  componentDidMount() {
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/transaction/withdraw/pending',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          _this.setState({submits: res.data.submits})
        }
      })
      .catch(function (error) {
        console.log('Exception/withdraw : mount', error)
      })

    this.setState({initial: true})

    this.getAddress()
  }


  //************************* render ************************//

  render() {
    const { getFieldDecorator } = this.props.form
    const { sortedInfo, submit, address } = this.state
    const columns = [
      {
        title: 'Time',
        dataIndex: 'utc',
        key: 'utc',
        className: 'col-left',
        render: (utc) => {
          return (getDateTime(utc))
        }
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        className: 'col-right',
        render: (amount) => {
          return ('$' + formatNumber(amount))
        }
      },
      {
        title: '',
        dataIndex: 'id',
        key: 'id',
        className: 'col-center',
        render: (id, submit) => {
          return (
            <a onClick={(e) => {
                e.stopPropagation()
                this.cancelSubmit(submit)
              }}>Cancel</a>
          )
        }
      },
    ]

    return (
      <div className="m-withdraw">

        <div className="row">
          <div className="col-md-12 col-lg-8">

            <div className="content card">
              <div className="card-body">
                <Form onSubmit={this.send}>
                  <h4 className="title">How much do you want to withdraw?</h4>
                  <FormItem>
                    {getFieldDecorator('amount', {
                    })(
                      <Input
                        name='amount'
                        placeholder="0.00"
                        prefix={<i className="fa fa-dollar" />}
                        spellCheck="false"
                        value={this.state.amount}
                        onChange={this.onFund}
                      />
                    )}
                  </FormItem>
                  <br/>

                  <h4 className="title">How would you like to receive your funds?</h4>
                  <div className="row sp-row">
                    <div className="detail col-6">
                      <div className="row">
                        <RadioGroup defaultValue="paypal" className="select" onChange={this.onPaymentMethod}>
                          <RadioButton value="paypal" className="item">
                            <div className="img-paypal"><img src="resources/images/paypal.png" alt=""/></div>
                          </RadioButton>
                          <RadioButton value="check" className="item">
                            <div>
                              <span>Check</span>
                            </div>
                          </RadioButton>
                        </RadioGroup>
                      </div>

                      <div className="info">
                        <div>
                          <label>Minimum Withdrawal</label>
                          <label className="pull-right"><strong>
                            {this.state.payment_method == 'paypal' ? '$1' : '$15'}
                          </strong></label>
                        </div>
                        <div>
                          <label>Processing Time</label>
                          <label className="pull-right"><strong>
                            {this.state.payment_method == 'paypal'? '3-5' : '7-14'} Days
                          </strong></label>
                        </div>
                      </div>

                      <div style={{display: 'flex', margin: '20px 0px 0px'}}>
                        {this.state.payment_method == 'check'? (
                          <div className="address">
                            {address == '' ? (
                              <div>
                                <h5>No Address</h5>
                                <button className="m-button" onClick={this.addAddress}>Add New Address</button>
                              </div>
                            ):(
                              <div>
                                <h5>{address.real_name}</h5>
                                <h5>{address.addr}</h5>
                                <h5>{address.city} {address.state} {address.zip}</h5>
                                <h5>{address.phone}</h5>
                              </div>
                            )}
                          </div>
                        ):(
                          <Select
                            size={'large'}
                            onChange={this.onPaymentPaypal}
                            value={this.state.payment_sPaypal}
                            style={{ width: '280px', margin: 'auto'}}
                          >
                            {this.props.user_payments.map((payment, index) => {
                              if (payment.method == 'paypal') {
                                return (<Option value={index}>{payment.email}</Option>)
                              }
                            })}
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row button-center">
                    <Button
                      className="m-button"
                      onClick={this.withdraw}
                      disabled={this.state.submits.length > 0}
                    >
                      Request Withdrawal<Divider type='vertical'/>
                      <label className="amount-withdraw">${formatNumber(this.state.amount)}</label>
                    </Button>
                  </div>
                </Form>
              </div>
            </div>

          </div>

          <div className="col-lg-12 col-xl-4">

            <div className="available card">
              <div className="card-body">
                <h4>Available to Withdraw</h4>
                <h4 className="value">${formatNumber(this.props.userState.cash)}</h4>

                <div className="ml-5 mr-5">
                  <Divider/>
                </div>

                <h5>Current Balance</h5>
                <h4>${formatNumber(this.props.userState.cash)}</h4>
              </div>
            </div>

            {this.state.submits.length > 0 ? (
              <div className="transaction card">
                <div className="card-body">
                  <h4>Pending Withdrawals</h4>

                  <Table className="ant-table-dark col-lg-12"
                         columns={columns}
                         dataSource={this.state.submits}
                         onChange={this.sortTable}
                         rowKey="id"
                         onRow={(record, rowIndex) => {
                           return {
                             onClick: (e) => {
                               this.showDetail(record)
                             }
                           }
                         }}
                  />
                </div>
              </div>
            ) : null }

          </div>
        </div>


        {/*********************** submit detail *********************/}

        <Modal
          className="submit-detail spa-modal"
          visible={this.state.detail}
          onCancel={this.onHideDetail}
        >

          <div className="header">
            <h3>Withdrawal Request Details</h3>
          </div>

          <div className="detail">
            <Result
              status="success"
              title="Your withdrawal request is being processed."
              subTitle={<p>Confirmation Number: <strong>{submit.confirm}</strong></p>}
            />

            <div>
              <Row className="submit-header">
                <Col span={6}>Withdrawal Method</Col>
                <Col span={9}>Details</Col>
                <Col span={4}>Processing Time</Col>
                <Col className="text-right" span={5}>Amount</Col>
              </Row>

              <Divider className="submit-divider"/>

              <Row className="submit-body">
                <Col span={6}>
                  {submit.method == 'paypal' ? (
                    <div className="img-paypal">
                      <img src="resources/images/paypal.png" alt=""/>
                    </div>
                  ):(
                    'Check'
                  )}
                </Col>
                <Col span={9}>{submit.details}</Col>
                <Col span={4}>{submit.method == 'paypal' ? '3-5' : '7-14'} Days</Col>
                <Col className="text-right" span={5}><strong>${formatNumber(submit.amount)}</strong></Col>
              </Row>
            </div>

          </div>

          <div className="foot">
            <Button className="r-button" onClick={this.onHideDetail}> Cancel </Button>
          </div>
        </Modal>


        {/*********************** initial ***************************/}

        <Modal
          className="initial spa-modal"
          visible={this.state.initial}
        >

          <div className="header">
            <h3>Things to Know Before Withdraw</h3>
          </div>

          <div className="detail">
            <Row>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_1.png" alt=""/></h1>
                  <p>When possible, we will first refund all deposits made in the last 90 days.</p>
                </div>
              </Col>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_2.png" alt=""/></h1>
                  <p>Any excess funds after refundable deposits have been fulfilled are delivered via your selected withdrawal method.</p>
                </div>
              </Col>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_3.png" alt=""/></h1>
                  <p>If a card used to deposit is expired, refundable deposits will be returned to your new card as long as the account numbers are the same.</p>
                </div>
              </Col>
            </Row>

            <Row>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_4.png" alt=""/></h1>
                  <p>If you deposited with a gift card, refundable deposits will be returned up to the original value to that card.</p>
                </div>
              </Col>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_5.png" alt=""/></h1>
                  <p>If you no longer have access to a card used to make a prior deposit, please Contact Us before proceeding.</p>
                </div>
              </Col>
              <Col className="info" span={8}>
                <div>
                  <h1><img src="resources/images/w_6.png" alt=""/></h1>
                  <p>For confirmation of the final details of your withdrawal, you will receive an email from Sparlay with the subject line 'Withdrawal Request Completed.</p>
                </div>
              </Col>
            </Row>
          </div>

          <div className="button-center">
            <Button className="g-button" onClick={() => {this.setState({initial: false})}}>I Understand</Button>
          </div>

        </Modal>

      </div>
    )
  }
}

export default Withdraw
