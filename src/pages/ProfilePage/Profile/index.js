import React from 'react'
import axios from 'axios'
import qs from 'qs'
import { connect } from 'react-redux'
import { setUserState, setDialogState} from 'ducks/app'
import { cap, months } from 'siteGlobal/g'

import Modal from 'antd/lib/modal'
import Form from 'antd/lib/form'
import Table from 'antd/lib/table'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
import Switch from 'antd/lib/switch'
import message from 'antd/lib/message'

import './style.scss'
import Checkbox from "../../../components/LayoutComponents/Dialog";

const FormItem = Form.Item

const mapStateToProps = ({ app }) => {
  const { userState, user_payments, plans_vip, url } = app
  return {
    url: url,
    userState: userState,
    user_payments: user_payments,
    plans_vip: plans_vip
  }
}


@connect(mapStateToProps)
@Form.create()
class Profile extends React.Component {

  state = {
    sortedInfo: {},

    address: '',
    add_addr: false,
    remove_addr: false,

    chk: [
      [false, false, false],
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ],

    changePass: false,
  }


//************************** Profile **************************//

  onChangePass = () => {
    const { form } = this.props

    let {old_pass, new_pass, confirm_pass} = form.getFieldsValue()
    if (new_pass != confirm_pass) {
      form.setFields({
        confirm_pass: {
          value: confirm_pass,
          errors: [new Error('Passwords don\'t match!')]
        }
      })
    }

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/change_pass',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: this.props.userState.user_id,
        old_pass: old_pass,
        new_pass: new_pass
      })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          message.success('Succeeded to Change Password!')
          _this.setState({changePass: false})
          form.setFields({
            old_pass: '',
            new_pass: '',
            confirm_pass: ''
          })
        } else {
          if (res.data.err == 'pass') {
            form.setFields({
              old_pass: {
                value: old_pass,
                errors: [new Error('Wrong Password')]
              },
              new_pass: '',
              confirm_pass: ''
            })
          }
        }
      })
      .catch(function (error) {
        console.log('Exception/withdraw : submit', error)
      })
  }


//************************** Address **************************//

  getAddress = () => {
    const { form } = this.props
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/address/get',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          let address = res.data.address
          _this.setState({address: address}, () => {
            form.setFieldsValue({ real_name: address.real_name })
            form.setFieldsValue({ phone: address.phone })
            form.setFieldsValue({ address: address.addr + ', ' + address.city + ', ' + address.state + ', ' + address.zip })
          })
        }
      })
      .catch(function (e) {
        console.log('?: Fetch Address')
        console.log(e)
      })
  }

  onAddAddress = () => {
    const { form } = this.props
    form.setFieldsValue({ real_name: '' })
    form.setFieldsValue({ addr: '' })
    form.setFieldsValue({ city: '' })
    form.setFieldsValue({ state: '' })
    form.setFieldsValue({ zip: '' })
    form.setFieldsValue({ phone: '' })

    this.setState({add_addr: true})
  }

  addAddress = () => {
    const { form } = this.props
    const values = form.getFieldsValue()
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/address/add',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: this.props.userState.user_id,
        real_name: values.real_name,
        addr: values.addr,
        city: values.city,
        state: values.state,
        zip: values.zip,
        phone: values.phone
      })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          message.success('New Address successfully added!')
          _this.setState({
            address: {
              real_name: values.real_name,
              addr: values.addr,
              city: values.city,
              state: values.state,
              zip: values.zip,
              phone: values.phone
            },
            add_addr: false
          })
        } else {
          message.success('Failed to add new Address!')
        }
      })
      .catch(function (e) {
        console.log('?: Add Address')
        console.log(e)
      })
  }

  removeAddress = () => {
    this.setState({remove_addr: false})
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/address/remove',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          message.success('Your Address successfully removed!')
          _this.setState({address: ''})
        } else {
          message.success('Failed to remove Address!')
        }
      })
      .catch(function (e) {
        console.log('?: Remove Address')
        console.log(e)
      })
  }


//************************** Payment **************************//

  sortTable = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    })
  }

  removePayment = (pm_id) => {
    const { dispatch, userState } = this.props

    dispatch(setDialogState({
      loading: true,
      loadingText: '',
    }))

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/remove',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify({
        user_id: userState.user_id,
        pm_id: pm_id
      })
    })
      .then(function (res) {
        dispatch(setDialogState({ loading: false }))
        if (res.data.res == 'success') {
          location.reload()
        } else if (res.data.res == 'fail') {
          console.log('***/Profile:removePayment >', res.data.err)
          dispatch(setDialogState({ loading: false }))
        }
      })
      .catch(function (error) {
        console.log('???/Profile:removePayment >', error)
        dispatch(setDialogState({ loading: false }))
      })
  }

  addPayment = () => {
    this.props.dispatch(setDialogState({
      selectMethod: true,
      paymentFlow: 'add'
    }))
  }


//************************ Membership *************************//

  onChangeMembership = () => {
    this.props.dispatch(setDialogState({ upgradeVIP: true }))
  }

  onCancelMembership = () => {
    const { dispatch } = this.props
    dispatch(setDialogState({
      loading: true,
      loadingText: 'Canceling Sparlay Membership ...',
    }))
    axios({
      method: 'post',
      url: this.props.url + '/payment_paypal/membership/cancel',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res == 'success') {
          location.reload()
        } else if (res.data.res === 'fail') {
          dispatch(setDialogState({ loading: false }))
          message.error('Failed to Cancel Membership!')
          console.log('***/Profile:onCancelMembership >', err)
        }
      })
      .catch(function (error) {
        console.log('???/Profile:onCancelMembership >', error)
      })
  }


//************************ Notification ***********************//

  getNoti = () => {
    var { chk } = this.state
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/auth/noti/fetch',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to fetch notification:')
          console.log(res.data.err)
        } else if (res.data.res === 'success'){
          let n = res.data.notification

          if (n.c0.charAt(0) === '1') {
            chk[0][0] = true
          }
          if (n.c0.charAt(1) === '1') {
            chk[0][1] = true
          }
          if (n.c0 === '00') {
            chk[0][2] = true
          }

          if (n.c1.charAt(0) === '1') {
            chk[1][0] = true
          }
          if (n.c1.charAt(1) === '1') {
            chk[1][1] = true
          }
          if (n.c1 === '00') {
            chk[1][2] = true
          }

          if (n.c2.charAt(0) === '1') {
            chk[2][0] = true
          }
          if (n.c2.charAt(1) === '1') {
            chk[2][1] = true
          }
          if (n.c2 === '00') {
            chk[2][2] = true
          }

          if (n.c3.charAt(0) === '1') {
            chk[3][0] = true
          }
          if (n.c3.charAt(1) === '1') {
            chk[3][1] = true
          }
          if (n.c3 === '00') {
            chk[3][2] = true
          }

          _this.setState({
            chk: chk
          })
        }
      })
      .catch(function (error) {
        console.log('Exception: Fetch Notification')
        console.log(error)
      })
  }

  onCheckNoti = (r, co) => {
    let { chk } = this.state
    if (chk[r][co]) {
      if (co === 2) return
      chk[r][co] = false
      if (!chk[r][0] && !chk[r][1]) chk[r][2] = true
    } else {
      chk[r][co] = true
      if (co === 2) {
        chk[r][0] = false
        chk[r][1] = false
      } else {
        chk[r][2] = false
      }
    }

    this.setState({chk: chk})

    const { userState } = this.props
    var c = ['00', '00', '00', '00'], cc = [['0','0'],['0','0'],['0','0'],['0','0']]

    for (let i = 0; i < 4; i++) {
      for(let j = 0; j< 2; j++) {
        if (chk[i][j])
          cc[i][j] = '1'
      }
      c[i] = cc[i][0] + cc[i][1]
    }

    const postData = {
      user_id: userState.user_id,
      c: c,
    }
    axios({
      method: 'post',
      url: this.props.url + '/auth/noti/save',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify(postData)
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to fetch notification:')
          console.log(res.data.err)
        } else if (res.data.res === 'success'){

        }
      })
      .catch(function (error) {
        console.log('Exception: Fetch Notification')
        console.log(error)
      })
  }


//************************ Component **************************//

  componentDidMount() {
    const { form, userState } = this.props
    form.setFieldsValue({ username: userState.username })
    form.setFieldsValue({ email: userState.email })

    this.getNoti()
    this.getAddress()

  }


//************************* render ************************//

  render() {
    const { isMobile, plans_vip } = this.props
    const { getFieldDecorator } = this.props.form
    const vip = parseInt(this.props.userState.vip) - 1
    const { sortedInfo, chk, address } = this.state
    const columns = [
      {
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        className: 'col-center',
        render: (method, payment) => {
          if (method == 'card')
            // return (
            //   <div className="img-card">
            //     <img src={'resources/images/' + payment.brand + '.png'} alt=""/>
            //   </div>
            // )
            return ('Credit Card')
          else {
            return (
              <div className="img-paypal">
                <img src="resources/images/paypal.png" alt=""/>
              </div>
            )
          }
        }
      },
      {
        title: 'Detail',
        dataIndex: 'id',
        className: 'col-left',
        render: (status, payment) => {
          if (payment.method == 'card') {
            return (<label className="text-capitalize">{payment.brand} .....{payment.number} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{payment.exp}</label>)
          } else {
            return (payment.email)
          }
        }
      },
      {
        title: '',
        dataIndex: 'id',
        key: 'id',
        className: 'col-center',
        render: (id) => {
          return (
            <a onClick={(e) => {
                e.stopPropagation()
                this.removePayment(id)
              }}>Remove</a>
          )
        }
      },
    ]

    return (
      <div className="m-profile">

        <div className="row">
          <div className={isMobile?"col-md-12 col-lg-7 no-padding":"col-md-12 col-lg-7"}>

            <div className="profile card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/deposit.png" alt=""/>
                  <h4 className="d-inline-block"> &nbsp; Personal Information</h4>
                </div>
              </div>
              <div className="card-body">
                <Form>
                  <div className="row" style={{margin: '0'}}>
                    <FormItem className="col-md-6 col-sm-12">
                      <label className="field_des">Username</label>
                      {getFieldDecorator('username', {})
                      (
                        <Input
                          spellCheck="false"
                          disabled={true}
                        />
                      )}
                    </FormItem>
                    <FormItem className="col-md-6 col-sm-12">
                      <label className="field_des">Email</label>
                      {getFieldDecorator('email', {})
                      (
                        <Input
                          spellCheck="false"
                          disabled={true}
                        />
                      )}
                    </FormItem>
                  </div>
                  {address == '' ? (
                    <div className="address">
                      <p className="des">
                        {/*<strong>No Address</strong>*/}
                      </p>

                      {/*<div className="row button-center">*/}
                        {/*<Button className="m-button" onClick={this.onAddAddress}> Add Address </Button>*/}
                      {/*</div>*/}
                    </div>
                  ):(
                    <div>
                      <div className="row" style={{margin: '0'}}>
                        <FormItem className="col-md-6 col-sm-12">
                          <label className="field_des">Real Name</label>
                          {getFieldDecorator('real_name', {})
                          (
                            <Input
                              spellCheck="false"
                              disabled={true}
                            />
                          )}
                        </FormItem>
                        <FormItem className="col-md-6 col-sm-12">
                          <label className="field_des">Phone</label>
                          {getFieldDecorator('phone', {})
                          (
                            <Input
                              spellCheck="false"
                              disabled={true}
                            />
                          )}
                        </FormItem>

                        {/*<div className="row button-center">*/}
                          {/*<Button className="m-button" onClick={() => {this.setState({remove_addr: true})}}> Remove Address </Button>*/}
                        {/*</div>*/}
                      </div>
                      <div className="row" style={{margin: '0'}}>
                        <FormItem className="col-12">
                          <label className="field_des">Address</label>
                          {getFieldDecorator('address', {})
                          (
                            <Input
                              spellCheck="false"
                              disabled={true}
                            />
                          )}
                        </FormItem>
                      </div>
                    </div>
                  )}
                </Form>

                <div className="button-center">
                  <Button className="g-button" onClick={() => {this.setState({changePass: true})} }>
                    Change Password
                  </Button>
                </div>

              </div>
            </div>

            <div className="notis card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/contact.png" alt=""/>
                  <h4 className="d-inline-block"> &nbsp; Notification Settings</h4>
                </div>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th/>
                      <th>Email</th>
                      <th>Text</th>
                      <th>None</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Another Sparlay user accepts your bet</th>
                      <td><Switch size="small" checked={chk[0][0]} onChange={this.onCheckNoti.bind(this, 0, 0)}/></td>
                      <td><Switch size="small" checked={chk[0][1]} onChange={this.onCheckNoti.bind(this, 0, 1)}/></td>
                      <td><Switch size="small" checked={chk[0][2]} onChange={this.onCheckNoti.bind(this, 0, 2)}/></td>
                    </tr>
                    <tr>
                      <th scope="row">No Sparlay user accepted your bet</th>
                      <td><Switch size="small" checked={chk[1][0]} onChange={this.onCheckNoti.bind(this, 1, 0)}/></td>
                      <td><Switch size="small" checked={chk[1][1]} onChange={this.onCheckNoti.bind(this, 1, 1)}/></td>
                      <td><Switch size="small" checked={chk[1][2]} onChange={this.onCheckNoti.bind(this, 1, 2)}/></td>
                    </tr>
                    <tr>
                      <th scope="row">Your accepted Sparlay bet is over</th>
                      <td><Switch size="small" checked={chk[2][0]} onChange={this.onCheckNoti.bind(this, 2, 0)}/></td>
                      <td><Switch size="small" checked={chk[2][1]} onChange={this.onCheckNoti.bind(this, 2, 1)}/></td>
                      <td><Switch size="small" checked={chk[2][2]} onChange={this.onCheckNoti.bind(this, 2, 2)}/></td>
                    </tr>
                    <tr>
                      <th scope="row">A Sparlay user has sent you a bet</th>
                      <td><Switch size="small" checked={chk[3][0]} onChange={this.onCheckNoti.bind(this, 3, 0)}/></td>
                      <td><Switch size="small" checked={chk[3][1]} onChange={this.onCheckNoti.bind(this, 3, 1)}/></td>
                      <td><Switch size="small" checked={chk[3][2]} onChange={this.onCheckNoti.bind(this, 3, 2)}/></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className={isMobile?"col-md-12 col-lg-5 no-padding":"col-md-12 col-lg-5"}>

            <div className="membership card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/deposit.png" alt=""/>
                  <h4 className="d-inline-block"> &nbsp; Sparlay Membership</h4>
                </div>
              </div>

              <div className="card-body">
                <h4>
                  {plans_vip[vip].type}
                  {vip > 0 ? ' (' + plans_vip[vip].name + ')' : ''}
                </h4>
                <p className="des">
                  Subscription Cost:
                  <strong>
                    {vip > 0 ? ' $' + plans_vip[vip].cost + ' / ' + plans_vip[vip].cycle : ' Free*'}
                  </strong>
                </p>

                <div className="row button-center">
                  <Button className="m-button" onClick={this.onChangeMembership}> Change Membership </Button>
                </div>

                {vip > 0 ? (<a onClick={this.onCancelMembership}>Cancel Membership</a>) : null}
              </div>
            </div>

            <div className="payments card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/deposit.png" alt=""/>
                  <h4 className="d-inline-block"> &nbsp; My Payments</h4>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  <Table className="ant-table-dark col-lg-12"
                         columns={columns}
                         rowKey="id"
                         dataSource={this.props.user_payments}
                         onChange={this.sortTable}
                  />
                </div>

                {/*<div className="row button-center">*/}
                  {/*<Button className="m-button" onClick={this.addPayment}> Add New Payment </Button>*/}
                {/*</div>*/}
              </div>
            </div>

          </div>
        </div>


        <Modal
          className="change-pass spa-modal"
          visible={this.state.changePass}
          onCancel={() => {this.setState({changePass: false})} }
        >
          <div className="header">
            <h3>Change Password</h3>
          </div>

          <div className="detail">
            <Form >
              <FormItem>
                <label className="form-label mb-0">Current Password</label>
                {getFieldDecorator('old_pass', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input
                    prefix={<i className="fa fa-lock"  style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="password"
                    placeholder="Password"
                    spellCheck="false"
                  />,
                )}
              </FormItem>
              <br/>
              <FormItem>
                <label className="form-label mb-0">New Password</label>
                {getFieldDecorator('new_pass', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input
                    prefix={<i className="fa fa-lock"  style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="password"
                    placeholder="Password"
                    spellCheck="false"
                  />,
                )}
              </FormItem>
              <FormItem>
                <label className="form-label mb-0">Confirm New Password</label>
                {getFieldDecorator('confirm_pass', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input
                    prefix={<i className="fa fa-lock"  style={{ color: 'rgba(0,0,0,.25)' }} />}
                    type="password"
                    placeholder="Password"
                    spellCheck="false"
                  />,
                )}
              </FormItem>

              <Button className="m-button col-12" onClick={this.onChangePass}>
                Change
              </Button>

            </Form>
          </div>

        </Modal>

        <Modal
          className="add-addr spa-modal"
          visible={this.state.add_addr}
          onCancel={() => {this.setState({ add_addr: false })}}
        >
          <div className="header">
            <h3>Add Address</h3>
          </div>

          <div className="detail">
            <Form className="addr-form">
              <FormItem>
                <label className="form-label mb-0">Real Name</label>
                {getFieldDecorator('real_name', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input placeholder="Real Name" spellCheck="false"/>,
                )}
              </FormItem>
              <FormItem>
                <label className="form-label mb-0">Address</label>
                {getFieldDecorator('addr', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input placeholder="Address" spellCheck="false" />,
                )}
              </FormItem>
              <div className="row">
                <FormItem className="col-6" style={{paddingLeft: '0'}}>
                  <label className="form-label mb-0">City</label>
                  {getFieldDecorator('city', {
                    rules: [{ required: true, message: 'required!' }],
                  })(
                    <Input placeholder="City" spellCheck="false" />,
                  )}
                </FormItem>
                <FormItem className="col-3" style={{paddingLeft: '0'}}>
                  <label className="form-label mb-0">State</label>
                  {getFieldDecorator('state', {
                    rules: [{ required: true, message: 'required!' }],
                  })(
                    <Input placeholder="State" spellCheck="false" />,
                  )}
                </FormItem>
                <FormItem className="col-3" style={{paddingLeft: '0', paddingRight: '0'}}>
                  <label className="form-label mb-0">Zip Code</label>
                  {getFieldDecorator('zip', {
                    rules: [{ required: true, message: 'required!' }],
                  })(
                    <Input placeholder="Zip" spellCheck="false" />,
                  )}
                </FormItem>
              </div>
              <FormItem>
                <label className="form-label mb-0">Phone Number</label>
                {getFieldDecorator('phone', {
                  rules: [{ required: true, message: 'required!' }],
                })(
                  <Input placeholder="Phone" spellCheck="false" />,
                )}
              </FormItem>
              <br/>

              <div>
                <Button className="m-button col-12" onClick={this.addAddress}>
                  Add
                </Button>
              </div>
            </Form>
          </div>
        </Modal>

        <Modal
          className="remove-addr"
          visible={this.state.remove_addr}
          title="Remove Address"
          onCancel={() => {this.setState({remove_addr: false})}}
          footer={[
            <Button key="1" className="cancel" onClick={() => {this.setState({remove_addr: false})}}>Cancel</Button>,
            <Button key="2" className="ok" onClick={this.removeAddress}>OK</Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">Are you sure you want to remove this address?</label>
          </div>
        </Modal>

      </div>
    )
  }
}

export default Profile
