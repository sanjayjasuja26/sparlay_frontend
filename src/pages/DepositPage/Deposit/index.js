import React from 'react'
import { connect } from 'react-redux'
import { push } from "react-router-redux"
import numeral from 'numeral'
import axios from 'axios'
import qs from 'qs'
import { setDialogState } from 'ducks/app'
import { sparlayFund, invalidLocation } from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import Input from 'antd/lib/input'
import Divider from "antd/lib/divider"

import './style.scss'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button;

const mapStateToProps = ({ app }) => {
  const { userState, url, plans_upgrade } = app
  return {
    url: url,
    userState: userState,
    plans_upgrade: plans_upgrade
  }
}


@connect(mapStateToProps)
class Deposit extends React.Component {

  state = {
    deposit_value: '10',
    deposit_amount : '10',
    other : false,
    other_amount: '0',
  }


  //************************** Method ***********************//

  selectDeposit = (e) => {
    var val = e.target.value
    if(val === '0') {
      this.setState({
        other: true
      })
      val = this.state.other_amount
    }else{
      this.setState({
        other: false
      })
    }

    this.setState({
      deposit_amount: val,
      deposit_value: e.target.value,
    })
  }

  getOther = (e) => {
    this.setState({
      other_amount: e.target.value
    })

    if (this.state.other === true){
      this.setState({
        deposit_amount: e.target.value
      })
    }
  }

  selectOther = (e) => {
    this.setState({
      deposit_amount: e.target.value,
      deposit_value: '0',
      other: true,
    })
  }


  upgrade = () => {
    if (this.props.userState.user_id == '') {
      this.props.dispatch(setDialogState({loginPrompt: true}))
      return
    }

    this.props.dispatch(push('/uplimit'))
  }


  deposit = () => {
    const { userState, plans_upgrade, dispatch } = this.props
    if (userState.user_id == '') {
      dispatch(setDialogState({loginPrompt: true}))
      return
    }

    if (invalidLocation()) {
      dispatch(setDialogState({ locationPrompt: true }))
      return
    }

    if (parseFloat(this.state.deposit_amount) > parseFloat(plans_upgrade[parseInt(userState.lim) - 1].max_limit)) {
      dispatch(setDialogState({limitPrompt: true}))
      return
    }

    dispatch(setDialogState({
      selectPayment: true,
      paymentFlow: 'deposit',
      paymentAmount: this.state.deposit_amount
    }))
  }


  //************************** Component ***********************//

  componentDidMount() {

  }


  //************************** render **************************//

  render() {
    const { userState } = this.props
    return (
        <div className="sparlay-deposit">
          <div className="row">

            <div className="col-md-12 col-lg-8">
              <div className="secure card">
                <div className="card-header">
                  <div className="utils__title">
                    <img src="resources/images/deposit.png" alt=""/>
                    <h4 className="d-inline-block"> &nbsp; Sparlay Secure Deposit</h4>
                  </div>
                </div>
                <div className="card-body">
                  <h5>Select Amount ($USD)</h5>
                  <div className="row">
                    <RadioGroup
                      value={this.state.deposit_value}
                      className="secure__select col-lg-12"
                      onChange={this.selectDeposit}
                    >
                      <RadioButton value="10" className="secure__select__item col-lg-2">
                        <div className="m-dot"></div>
                        <span className="amount">{sparlayFund()}10</span>
                      </RadioButton>
                      <RadioButton value="100" className="secure__select__item col-lg-2">
                        <div className="m-dot"></div>
                        <span className="amount">{sparlayFund()}100</span>
                      </RadioButton>
                      <RadioButton value="250" className="secure__select__item col-lg-2">
                        <div className="m-dot"></div>
                        <span className="amount">{sparlayFund()}250</span>
                      </RadioButton>
                      <RadioButton value="500" className="secure__select__item col-lg-2">
                        <div className="m-dot"></div>
                        <span className="amount">{sparlayFund()}500</span>
                      </RadioButton>
                      <RadioButton value="1000" className="secure__select__item col-lg-2">
                        <div className="m-dot"></div>
                        <span className="amount">{sparlayFund()}1,000</span>
                      </RadioButton>
                      <RadioButton value="0" className="secure__select__other col-lg-2">
                        <div className="m-dot"></div>
                        <span className="lb">Other</span>
                        <Input placeholder="$0" className='secure__other__amount'
                               onChange={this.getOther} onFocus={this.selectOther}/>
                      </RadioButton>
                    </RadioGroup>
                  </div>

                  <div className="row button-center">
                    <Button className="m-button btn-deposit" onClick={this.deposit}>
                      Deposit<Divider type='vertical'/>
                      <label className="amount-deposit">${numeral(this.state.deposit_amount).format('0,0[.]00')}</label>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-xl-4">
              <div className="funds card">
                <div className="card-header">
                  <div className="funds__title utils__title">
                    <h4 className="d-inline-block">$ &nbsp; Your Funds</h4>
                  </div>
                </div>
                <div className="card-body">
                  <div className="funds__row">
                    <label>Available Funds for Sparlay</label>
                    <label className="d-inline-block pull-right funds__value">{sparlayFund()}{numeral(userState.cash).format('0,0.00')}</label>
                  </div>
                  <div className="funds__row">
                    <label>Minimum Deposit & Wager</label>
                    <label className="d-inline-block pull-right funds__value">{sparlayFund()}{numeral(10).format('0,0.00')}</label>
                  </div>
                  <div className="funds__row">
                    <label>Maximum Deposit & Wager</label>
                    <label className="d-inline-block pull-right funds__value">{sparlayFund()}{numeral(this.props.plans_upgrade[parseInt(userState.lim) - 1].max_limit).format('0,0.00')}</label>
                  </div>

                  <div className="row button-center">
                    <Button className="m-button" onClick={this.upgrade}>
                      UPGRADE MAX DEPOSIT AND WAGER
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default Deposit
