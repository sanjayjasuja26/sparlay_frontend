import React from 'react'
import { connect } from 'react-redux'
import numeral from 'numeral'
import axios from 'axios'
import qs from 'qs'
import { setDialogState } from 'ducks/app'
import { sparlayFund } from 'siteGlobal/g'
import './style.scss'

import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'

const RadioGroup = Radio.Group
const RadioButton = Radio.Button;

const mapStateToProps = ({ app }) => {
  const { userState, url, plans_vip, plans_upgrade } = app
  return {
    userState: userState,
    url: url,

    plans_vip: plans_vip,
    plans_upgrade: plans_upgrade
  }
}

const lim_cycle = {
  'no': '',
  'one_time': ' / One-Time',
  'weekly': ' / week',
  'monthly': ' / month',
  'yearly': ' / year',
  'h_yearly': ' / biannual'
}

@connect(mapStateToProps)
class Uplimit extends React.Component {

  state = {
    plan_vip: 0,
    plan_upgrade: 1,
    type: 'cycle',
  }


  //************************* Method **************************//

  onSelectPlan = (e) => {
    this.setState({
      plan_upgrade: e.target.value,
    })
  }

  onType = (e) => {
    this.setState({ type: e.target.value })
  }

  onChangeVIP = () => {
    this.props.dispatch(setDialogState({ upgradeVIP: true }))
  }

  upgrade = () => {
    const { userState, dispatch, plans_vip } = this.props
    if (userState.vip == '1') {
      dispatch(setDialogState({ membershipPrompt: true }))
      return
    }

    let upgradeKey = plans_vip[parseInt(userState.vip) - 1].vip_key
    if (this.state.type == 'one_time') upgradeKey = 'one_time'

    dispatch(setDialogState({
      selectPayment: true,
      paymentFlow: 'upgrade_limit',
      upgradeKey: upgradeKey,
      upgradePlan: this.state.plan_upgrade + 1,
    }))
  }


  //************************ Component ************************//

  componentDidMount() {
  }


  //************************** render **************************//

  render() {
    const { plans_vip, plans_upgrade, isMobile } = this.props
    const { vip, lim, upgrade_key } = this.props.userState

    return (
      <div className="sparlay-upgrade">
        <div className="row">
          <div className="col-md-12 col-lg-8">
            <div className="secure card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/deposit.png" alt=""/>
                  <h4 className="d-inline-block"> &nbsp; Upgrade Maximum Deposit and Wager</h4>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  {!isMobile ? (
                    <div className="selection-header col-lg-2">
                      <p className="des">Maximum Limit</p>
                      {vip != '2' && vip !='1' ? (
                        <p className="des">{plans_vip[parseInt(vip) - 1].name} Cost</p>
                      ) : (
                        <p className="des">One-Time Cost</p>
                      )}
                      {vip != '2' && vip !='1' ? (<p className="des" style={{marginTop: '22px'}}>One-Time Cost</p>) : null}
                    </div>
                  ) : null}

                  <RadioGroup
                    value={this.state.plan_upgrade}
                    className="select col-lg-10"
                    onChange={this.onSelectPlan}
                  >
                    {plans_upgrade.map((plan, index) => {
                      if (index > 0) {
                        return (
                          <RadioButton
                            className={vip !='2' && vip !='1' ? "item col-lg-2" : "item item-one_day col-lg-2"}
                            value={index}
                            key={index}>
                            <div className="m-dot"></div>
                            {(parseFloat(plan.max_limit) < 0)? (
                              <h5 className="amount">No Limit</h5>
                            ) : (
                              <h5 className="amount">{sparlayFund()}{numeral(plan.max_limit).format('0,0[.]00')}</h5>
                            )}
                            <h6 className="price">${numeral(plan[plans_vip[parseInt(vip) - 1].vip_key]).format('0,0[.]00')}</h6>
                            {vip != '2' && vip !='1' ? (<p>OR</p>) : null}
                            {vip != '2' && vip !='1' ? (<h6 className="price">${numeral(plan.one_time).format('0,0[.]00')}</h6>) : null}
                          </RadioButton>
                        )
                      }
                    })}
                  </RadioGroup>
                </div>

                <h5>Upgrade Description</h5>
                <div className="secure__detail">
                  <p className="des">New Maximum Deposit and Wager:
                    {parseFloat(plans_upgrade[this.state.plan_upgrade].max_limit) < 0 ? (
                      <strong> No Limit</strong>
                    ) : (
                      <strong>{sparlayFund()}{numeral(plans_upgrade[this.state.plan_upgrade].max_limit).format('0,0[.]00')}</strong>
                    )}
                  </p>
                  {vip != '2' && vip !='1' ? (
                    <div className="des">
                      Choose Payment Plan:
                      <RadioGroup value={this.state.type} className="des-select" onChange={this.onType}>
                        <RadioButton className="item" value="cycle">
                          {plans_vip[parseInt(vip) - 1].name}
                        </RadioButton>
                        OR
                        <RadioButton className="item" value="one_time">
                          One-Time
                        </RadioButton>
                      </RadioGroup>
                      {isMobile? (
                        <h6 className="text-center" style={{marginTop: '10px', fontWeight: '400'}}>(Must Pick One)</h6>
                      ) : '(Must Pick One)'}
                    </div>
                  ) : null}
                  <p className="des">Additional Cost:
                    {this.state.type == "one_time" ? (
                      <strong> ${numeral(plans_upgrade[this.state.plan_upgrade].one_time).format('0,0[.]00')}</strong>
                    ):(
                      <strong> ${numeral(plans_upgrade[this.state.plan_upgrade][plans_vip[parseInt(vip) - 1].vip_key]).format('0,0[.]00')}</strong>
                    )}
                  </p>
                </div>

                <div className="row button-center">
                  <Button className="m-button btn-purchase" onClick={this.upgrade}>
                    Ugrade
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 col-lg-4">
            <div className="funds card">
              <div className="card-header">
                <div className="funds__title utils__title">
                  <h4 className="d-inline-block">$ &nbsp; Your Current Plan and Maximum</h4>
                </div>
              </div>
              <div className="card-body">
                <p className="des">
                  Current Subscription:
                  <strong>
                    {' ' + plans_vip[parseInt(vip) - 1].type}
                    {parseInt(vip) > 1 ? ' (' + plans_vip[parseInt(vip) - 1].name + ')' : ''}
                  </strong>
                  <Button className="y-button" onClick={this.onChangeVIP}>Change</Button>
                </p>
                <p className="des">
                  Subscription Cost:
                  <strong>
                    {parseInt(vip) > 1 ? ' $' + plans_vip[parseInt(vip) - 1].cost + ' / ' + plans_vip[parseInt(vip) - 1].cycle : 'Free*'}
                  </strong>
                </p>
                <p className="des">Maximum Deposit and Wager:
                  {lim == '7' ? (
                    <strong> No Limit</strong>
                  ) : (
                    <strong>{sparlayFund()}{numeral(plans_upgrade[parseInt(lim) - 1].max_limit).format('0,0[.]00')}</strong>
                  )}
                </p>
                {lim != '1' ? (
                  <p className="des">Upgrade Limits Cost:&nbsp;
                    {upgrade_key != 'one_time' ? (
                      <strong>${numeral(plans_upgrade[parseInt(lim) - 1][upgrade_key]).format('0,0[.]00')}</strong>
                    ) : (
                      <strong>${numeral(plans_upgrade[parseInt(lim) - 1].one_time).format('0,0[.]00')}</strong>
                    )}
                    <strong>{lim_cycle[upgrade_key]}</strong>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Uplimit
