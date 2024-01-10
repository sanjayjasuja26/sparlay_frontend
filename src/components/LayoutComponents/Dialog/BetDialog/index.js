import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import axios from 'axios'
import qs from 'qs'
import { setDialogState, setUserState } from 'ducks/app'
import {
  sparlayToken,
  sparlayFund,
  sportImgs,
  getDateTime,
  cloneHash,
  formatNumber,
  formatPoint,
  formatOdds,
  formatSpread,
  renderCurrency,
  renderOverviewTitle,
  renderBetResult,
  getOpponent,
  teamData,
  oddsData
} from 'siteGlobal/g'

import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Tag from 'antd/lib/tag'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Divider from 'antd/lib/divider'
import message from 'antd/lib/message'

import './style.scss'

const TabPane = Tabs.TabPane


const mapStateToProps = ({ app }) => {
  const { userState, user_payments, dialogState, url } = app
  return {
    url: url,
    userState: userState,

    viewStraight: dialogState.viewStraight,
    viewParlay: dialogState.viewParlay,
    bet: dialogState.bet,
    msg: dialogState.msg,

    upgradeKey: dialogState.upgradeKey,
    upgradePlan: dialogState.upgradePlan
  }
}


@connect(mapStateToProps)
class BetDialog extends React.Component {

  state = {
    parlay_bets: [],
    oparlay_bets: [],
  }


  //*************************** straight ***************************//

  onYesStraigth = () => {

  }

  onNoStraight = () => {

  }


  //*************************** parlay *****************************//

  onYesParlay = () => {

  }

  onNoParlay = () => {

  }

  getParlay = (t_id) => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/parlay',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({t_id: t_id})
    })
      .then(function (res) {
        if (res.data.res === 'success'){
          let bets = res.data.bets, parlay_bets = [], oparlay_bets = []
          for(let bet of bets) {
            let obet = cloneHash(bet)
            if (bet.type == 'O/U') {
              if (bet.team == 'Over') {
                obet.team = 'Under'
              }else{
                obet.team = 'Over'
              }
            }else{
              if (bet.team == bet.team1) {
                obet.team = bet.team2
              }else{
                obet.team = bet.team1
              }
            }

            obet.odds = formatOdds(-parseInt(bet.odds))
            obet.point = -parseFloat(bet.point)
            if (obet.point != 0) obet.point = formatPoint(obet.point)

            parlay_bets.push(bet)
            oparlay_bets.push(obet)
          }
          if (_this.state.searchCat == 'open' && _this.state.searchCat == 'wager') {
            _this.setState({
              parlay_bets: oparlay_bets,
              oparlay_bets: parlay_bets,
            })
          } else {
            _this.setState({
              parlay_bets: parlay_bets,
              oparlay_bets: oparlay_bets,
            })
          }
        }
      })
      .catch(function (err) {
        console.log(err)
      })
  }


  //**************************** component *************************//

  componentDidMount() {
  }


  //**************************** render ****************************//

  render() {
    const { isMobile, dispatch, bet, obet } = this.props
    const { parlay_bets, oparlay_bets } = this.state

    return (
      <div className="dialogs-bet">

        <Modal
          className="view-straight"
          visible={this.props.viewStraight}
          title={renderOverviewTitle(bet.accept)}
          onCancel={this.onCancelStraight}
          footer={[
            <Button key="1" className="decline pull-left" onClick={this.straightCancel}>
              {bet.accept == '0' ? "Decline Bet" : "Cancel Bet"}
            </Button>,
            <Button key="2" className="accept" onClick={this.straightOK}>
              {bet.accept == '0' ? "Accept Bet" : "Keep Bet"}
            </Button>,
          ]}
        >
          <Tabs className={ isMobile ? "tab-m" : "tab" } onChange={(key) => {}}>
            <TabPane tab="My Bet" key="1">
              <div className="field">
                <label className="field__title">Sport</label>
                <label className="field__value pull-right">
                  {sportImgs(bet.sport)}
                  {bet.league}
                </label>
              </div>
              <div className="field2">
                <label className="field2__title">Match</label>
                <div className="field2__value pull-right">
                  <div>{bet.team1}</div>
                  <div>{bet.team2}</div>
                </div>
              </div>
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{bet.bet_type}</label>
              </div>
              <div className="field">
                <label className="field__title">Bet</label>
                <label className="field__value pull-right">{bet.teamData}</label>
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{bet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <div className="field__value pull-right">{renderCurrency(bet.currency, bet.bet)}</div>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <div className="field__value pull-right">{renderCurrency(bet.currency, bet.win)}</div>
              </div>
              <div className="field">
                <label className="field__title">Live</label>
                <label className="field__value pull-right">{getDateTime(bet.utc)}</label>
              </div>
            </TabPane>

            <TabPane tab="Their Bet" key="2">
              <div className="field">
                <label className="field__title">Sport</label>
                <label className="field__value pull-right">
                  {sportImgs(bet.sport)}
                  {bet.league}
                </label>
              </div>
              <div className="field2">
                <label className="field2__title">Match</label>
                <div className="field2__value pull-right">
                  <div>{obet.team1}</div>
                  <div>{obet.team2}</div>
                </div>
              </div>
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{obet.bet_type}</label>
              </div>
              <div className="field">
                <label className="field__title">Bet</label>
                <label className="field__value pull-right">{obet.teamData}</label>
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{obet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <div className="pull-right">{renderCurrency(bet.currency, obet.bet)}</div>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <div className="pull-right">{renderCurrency(bet.currency, bet.win)}</div>
              </div>
              <div className="field">
                <label className="field__title">Live</label>
                <label className="field__value pull-right">{getDateTime(bet.utc)}</label>
              </div>
            </TabPane>
          </Tabs>

          {bet.result !== "" && bet.result != undefined ? (
            <div className="field" style={{border: '0px', textAlign: 'center'}}>
              {renderBetResult(bet.result)}
            </div>
          ): null }
        </Modal>


        <Modal
          className="view-parlay"
          visible={this.state.viewParlay}
          title={renderOverviewTitle(bet.accept)}
          onCancel={this.parlayHide}
          footer={[
            <Button key="1" className="decline pull-left" onClick={this.parlayCancel}>
              {bet.accept == '0' ? "Decline Bet" : "Cancel Bet"}
            </Button>,
            <Button key="2" className="accept" onClick={this.parlayOK}>
              {bet.accept == '0' ? "Accept Bet" : "Keep Bet"}
            </Button>,
          ]}
        >
          <Tabs className={ isMobile ? "tab-m" : "tab" } onChange={(key) => {}}>
            <TabPane tab="My Bet" key="1">
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{bet.type}</label>
              </div>
              <div className="field">
                <label className="field__title">Bets</label>
                <label className="field__value pull-right">{bet.type}</label>
              </div>
              <div className="field" style={{padding: '12px 16px 12px'}}>
                {this.state.parlay_bets.map((bet, index) =>
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">
                        {bet.league}
                      </label>
                      <label className="field2__title pull-right">{getDateTime(bet.utc)}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__title">{bet.team1} </label>
                      <label className="field2__title">&nbsp; -vs- &nbsp;</label>
                      <label className="field2__title"> {bet.team2}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__value">{bet.team}</label>
                      <label className="field2__title">&nbsp;({bet.type})</label>
                      <label className="field2__value pull-right">{oddsData(bet.type, bet.point, bet.odds)}</label>
                    </div>
                    {index < (this.state.parlay_bets.length - 1) ? (
                      <Divider>
                        {bet.accept > 0 ? (
                          <Tag className="tag-condition" color="#eec201">OR</Tag>
                        ) : (
                          <Tag className="tag-condition" color="#eec201">AND</Tag>
                        )}
                      </Divider>
                    ):null}
                  </div>
                )}
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{bet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <label className="field__value pull-right">{renderCurrency(bet.currency, bet.bet)}</label>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <label className="field__value pull-right">{renderCurrency(bet.currency, bet.win)}</label>
              </div>
            </TabPane>

            <TabPane tab="Their Bet" key="2">
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{obet.type}</label>
              </div>
              <div className="field">
                <label className="field__title">Bets</label>
                <label className="field__value pull-right">{obet.type}</label>
              </div>
              <div className="field" style={{padding: '12px 16px 12px'}}>
                {this.state.oparlay_bets.map((bet, index) =>
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">
                        {bet.league}
                      </label>
                      <label className="field2__title pull-right">{getDateTime(bet.utc)}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__title">{bet.team1} </label>
                      <label className="field2__title">&nbsp; -vs- &nbsp;</label>
                      <label className="field2__title"> {bet.team2}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__value">{bet.team}</label>
                      <label className="field2__title">&nbsp;({bet.type})</label>
                      <label className="field2__value pull-right">{oddsData(bet.type, bet.point, bet.odds)}</label>
                    </div>
                    {index < (this.state.oparlay_bets.length - 1) ? (
                      <Divider>
                        {obet.accept > 0 ? (
                          <Tag className="tag-condition" color="#eec201">OR</Tag>
                        ) : (
                          <Tag className="tag-condition" color="#eec201">AND</Tag>
                        )}
                      </Divider>
                    ):null}
                  </div>
                )}
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{obet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <label className="field__value pull-right">{renderCurrency(obet.currency, obet.bet)}</label>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <label className="field__value pull-right">{renderCurrency(bet.currency, bet.win)}</label>
              </div>
            </TabPane>
          </Tabs>

          {bet.result !== "" && bet.result != undefined ? (
            <div className="field" style={{border: '0px', textAlign: 'center'}}>
              {renderBetResult(bet.result)}
            </div>
          ): null }
        </Modal>

      </div>
    )
  }

}


export default BetDialog
