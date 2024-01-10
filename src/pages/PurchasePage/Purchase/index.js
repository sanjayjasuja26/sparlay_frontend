import React from 'react'
import { connect } from 'react-redux'
import numeral from 'numeral'
import { setDialogState } from 'ducks/app'
import { sparlayToken } from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import Select from 'antd/lib/select'
import Divider from 'antd/lib/divider'

import './style.scss'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button;

const mapStateToProps = ({ app }) => {
  const { userState, url, plans_purchase } = app
  return {
    url: url,
    userState: userState,
    plans_purchase: plans_purchase
  }
}


@connect(mapStateToProps)
class Purchase extends React.Component {

  state = {
    purchase_id: 0,
  }


  //************************** Method ***********************//

  selectPlan = (e) => {
    this.setState({
      purchase_id: e.target.value,
    })
  }

  purchase = () => {
    if (this.props.userState.user_id == '') {
      this.props.dispatch(setDialogState({loginPrompt: true}))
      return
    }

    this.props.dispatch(setDialogState({
      selectPayment: true,
      paymentFlow: 'purchase',
      paymentAmount: this.props.plans_purchase[this.state.purchase_id].price,
      paymentToken: this.props.plans_purchase[this.state.purchase_id].token
    }))
  }


  //************************** component ***********************//

  componentDidMount() {
  }


  //************************** render **************************//

  render() {

    return (
        <div className="sparlay-purchase">
          <div className="row">

            <div className="col-md-12 col-lg-2"></div>

            <div className="col-md-12 col-lg-8">
              <div className="secure card">
                <div className="card-header">
                  <div className="utils__title">
                    <img src="resources/images/deposit.png" alt=""/>
                    <h4 className="d-inline-block"> &nbsp; Secure Sparlay Tokens Purchase</h4>
                  </div>
                </div>
                <div className="card-body">
                  <h5 style={{marginBottom: '0px'}}>Select Package</h5>
                  <div className="row">
                    <RadioGroup
                      value={this.state.purchase_id}
                      className="secure__select col-lg-12"
                      onChange={this.selectPlan}
                    >
                      {this.props.plans_purchase.map((plan, index) =>
                        <RadioButton value={index} className="secure__select__item col-lg-2">
                          <div className="m-dot"></div>
                          <h4 className="amount">{sparlayToken()}{numeral(plan.token).format('0,0[.]00')}</h4>
                          <h5 className="price">{numeral(plan.price).format('$0,0[.]00')}</h5>
                        </RadioButton>
                      )}
                    </RadioGroup>
                  </div>

                  <div className="row button-center">
                    <Button className="m-button btn-purchase" onClick={this.purchase}>
                      Purchase<Divider type='vertical'/>
                      <label className="amount-purchase">{sparlayToken()}{numeral(this.props.plans_purchase[this.state.purchase_id].token).format('0,0[.]00')}</label>
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

export default Purchase
