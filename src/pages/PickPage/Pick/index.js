import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link } from 'react-router-dom'
import { Games } from './Games'
import { setDialogState, setUserState, setSiteState } from 'ducks/app'
import axios from 'axios'
import qs from 'qs'
import './style.scss'
import { getDateTime, sparlayToken, sportImgs, sparlayFund, invalidLocation } from 'siteGlobal/g'
import numeral from 'numeral'

import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Tag from 'antd/lib/tag'
import Input from 'antd/lib/input'
import message from 'antd/lib/message'
import List from 'antd/lib/list'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Statistic from 'antd/lib/statistic'
import Table from 'antd/lib/table'
import Divider from 'antd/lib/divider'

const Url = require('url')

const InputGroup = Input.Group
const Search = Input.Search
const { TabPane } = Tabs
const { Countdown } = Statistic


const mapStateToProps = ({ app }) => {
  const { siteState , userState , url, dialogState } = app
  return {
    url: url,
    token: userState.token,
    cash: userState.cash,
    role: userState.role,
    user_id: userState.user_id,
    userState: userState,
    referral: siteState.referral,
    store: siteState.store,
    msg: dialogState.msg,
  }
}

@connect(mapStateToProps)
class Pick extends React.Component {

  state = {
    c_id: '',
    operation: 'enter',
    detail: {
      main: {
        sports: '',
        start: Date.now(),
        leagues: '',
      },
      prizes: [{
        st: '',
        ed: '',
        prize: ''
      }],
      games: []
    },

    leagues: [],
    leaguePicks_init: [],
    leaguePicks: [],
    totalPicks: 0,
    picks: [],

    detail_visible: false,
    success_visible: false,
    search: '',
    entrants: [],

    tokenPrompt: false,
  }


  copyLink = () => {
    var textarea = document.createElement('textarea')
    textarea.value = 'https://playsparlay.com/pick?contest=' + this.state.c_id
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('Copied!')
  }

  shareLink = () => {
    var textarea = document.createElement('textarea')
    textarea.value = this.props.referral
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('Copied!')
  }

  enter = (currency) => {
    var { dispatch , userState } = this.props

    if (this.props.user_id === '') {
      dispatch(setDialogState({ loginPrompt: true }))
      return
    }

    if (currency == '0') {
      if (parseFloat(this.props.userState.token) < parseFloat(this.state.detail.main.fee_token)) {
        dispatch(setDialogState({ tokenPrompt: true }))
        // this.setState({tokenPrompt: true})
        return
      }
    } else if (currency == '1') {
      if (invalidLocation()) {
        dispatch(setDialogState({ locationPrompt: true }))
        return
      }
      if (this.props.userState.role == 'free') {
        dispatch(setDialogState({ membershipPrompt: true }))
        return
      }
      if (parseFloat(this.props.userState.cash) < parseFloat(this.state.detail.main.fee_cash)) {
        dispatch(setDialogState({ cashPrompt: true }))
        return
      }
    }

    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/contest/enter',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({
        c_id: this.state.c_id,
        u_id: this.props.user_id,
        picks: this.state.picks,
        currency: currency,
        operation: this.state.operation
      })
    })
    .then(function (res) {
      if (res.data.res === 'fail'){
        console.log('Failed to fetch contest detail:', res.data.err)
      } else if (res.data.res === 'success'){
        if (_this.state.operation == 'enter') {
          userState.cash = res.data.balance.cash
          userState.token = res.data.balance.token
          window.localStorage.setItem('sparlay.userData', JSON.stringify(userState))
          dispatch(setUserState({ userState: userState }))
        }
        _this.setState({success_visible: true})
      }
    })
    .catch(function (error) {
      console.log(error)
      return false
    })
  }


//******************************* Modal *******************************//

  showDetail = () => {
    this.setState({
      detail_visible: true,
      search: ''
    }, this.searchEntrants)
  }

  hideDetail = () => {
    this.setState({
      detail_visible: false
    })
  }

  onSearch = (e) => {
    this.setState({
      search: e.target.value,
    }, this.searchEntrants)
  }

  searchEntrants = () => {
    let entrants = [], e = [], search = this.state.search
    for (let entrant of this.state.detail.entrants) {
      if (search != '') {
        if (entrant.username.includes(search)) {
          e.push(entrant.username)
        }
      } else {
        e.push(entrant.username)
      }

      if (e.length > 2) {
        entrants.push({
          index: entrants.length,
          e1: e[0],
          e2: e[1],
          e3: e[2]
        })
        e = []
      }
    }
    if (e.length > 0) {
      e.push('')
      if (e.length < 3) {
        e.push('')
      }
      entrants.push({
        index: entrants.length,
        e1: e[0],
        e2: e[1],
        e3: e[2]
      })
    }

    this.setState({
      entrants: entrants
    })
  }


  depositOk = () => {
    // const { dispatch } = this.props
    // dispatch(push('/deposit'))
    this.setState({
      tokenPrompt: false
    })
  }

  hideTokenPrompt = () => {
    this.setState({
      tokenPrompt: false
    })
  }


  hideMembershipPrompt = () => {
    this.setState({
      membershipPrompt: false
    })
  }

  upgrade = () => {
    this.setState({
      membershipPrompt: false
    })
    var { dispatch } = this.props
    dispatch(setDialogState({ join1: true }))
  }


//******************************* Component ***************************//

  buildPicks = () => {
    let leaguePicks = []
    for (let league of this.state.leagues) {
      let pick = {
        league: league,
        games: 0,
        picked: 0
      }
      leaguePicks.push(pick)
    }

    let picks = []
    for (let index in this.state.detail.games) {
      let game = this.state.detail.games[index]
      let i = this.state.leagues.indexOf(game.league_title)
      leaguePicks[i].games += 1
      if (this.state.detail.picks.length > 0) {
        leaguePicks[i].picked += 3
      } else {
        picks.push({
          game_id: game.game_id,
          spread: '0',
          line: '0',
          total: '0',
          utc: game.utc
        })
      }
    }

    if (this.state.detail.picks.length > 0) {
      picks = this.state.detail.picks
      this.setState({operation: 'edit'})
    }
    this.setState({
      leaguePicks_init: leaguePicks,
      picks: picks
    }, this.calPicks)
    this.searchEntrants()
  }

  calPicks = () => {
    let leaguePicks = []
    for (let p of this.state.leaguePicks_init) {
      leaguePicks.push({
        league: p.league,
        games: p.games,
        picked: 0
      })
    }

    let totalPicks = 0
    for (let index in this.state.detail.games) {
      let i = this.state.leagues.indexOf(this.state.detail.games[index].league_title)
      let pick = this.state.picks[index]
      if (pick.spread != '0') {
        leaguePicks[i].picked++
        totalPicks++
      }
      if (pick.line != '0') {
        leaguePicks[i].picked++
        totalPicks++
      }
      if (pick.total != '0') {
        leaguePicks[i].picked++
        totalPicks++
      }
    }

    this.setState({
      totalPicks: totalPicks,
      leaguePicks: leaguePicks
    })
  }

  pick = (picks) => {
    this.setState({
      picks: picks
    }, this.calPicks)
  }

  renderFee = (contest) => {
    if (contest.currency == '0') {
      return (
        <label style={{fontWeight: '500'}}>{sparlayToken()}{numeral(contest.fee_token).format('0,0[.]00')}</label>
      )
    } else if (contest.currency == '1') {
      return (
        <label style={{fontWeight: '500'}}>{sparlayFund()}{numeral(contest.fee_cash).format('0,0[.]00')}</label>
      )
    } else {
      return (
        <label style={{fontWeight: '500'}}>
          {sparlayFund()}{numeral(contest.fee_cash).format('0,0[.]00')}
          <span style={{margin: '0 3px', color: '#bfbfbf'}}> OR </span>
          {sparlayToken()}{numeral(contest.fee_token).format('0,0[.]00')}
        </label>
      )
    }
  }


  fetchDetail = (c_id) => {
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/contest/detail',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({c_id: c_id, u_id: this.props.user_id})
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to fetch contest detail:', res.data.err)
          return false
        } else if (res.data.res === 'success'){
          _this.setState({
            detail: res.data.detail,
            leagues: res.data.detail.main.leagues.split(', ')
          }, _this.buildPicks)
          return true
        }
      })
      .catch(function (error) {
        console.log(error)
        return false
      })
  }

  componentDidMount() {
    if (this.props.store.page == '/pick') {
      this.setState(this.props.store.data)
      const { dispatch } = this.props
      dispatch(setSiteState({
        store: {
          page: '',
          data: {}
        }
      }))
    } else {
      let self_url = window.location.href
      let c_id = Url.parse(self_url, true).query.contest
      this.setState({c_id: c_id})
      this.fetchDetail(c_id)
    }
  }

  componentWillReceiveProps(newProps) {
    const { msg } = newProps
    if (msg == '') return

    const { dispatch } = this.props

    dispatch(setDialogState({ msg: '' }))
    dispatch(setSiteState({
      store: {
        page: '/pick',
        data: this.state
      }
    }))
    window.localStorage.setItem('sparlay.userStore', JSON.stringify({
      page: '/pick',
      data: this.state
    }))

    if (msg == 'cash') {
      dispatch(push('/deposit'))
    } else if (msg == 'token') {
      dispatch(push('/purchase'))
    } else if (msg == 'membership') {
      dispatch(push('/profile'))
    } else if (msg == 'limit') {
      dispatch(push('/uplimit'))
    }
  }


//******************************* Render ******************************//

  render() {
    const { isMobile } = this.props
    const columns_entrant = [
      {
        title: 'Usrname',
        dataIndex: 'e1',
        key: 'e1',
        width: '33.3%',
        className: 'col-left',
      },
      {
        title: 'Username',
        dataIndex: 'e2',
        key: 'e2',
        width: '33.3%',
        className: 'col-left',
      },
      {
        title: 'Username',
        dataIndex: 'e3',
        key: 'e3',
        className: 'col-left',
      },
    ]
    const balance = (<h5>Balance: {sparlayFund()}{numeral(this.props.cash).format('0,0[.]00')},
      {sparlayToken()}{numeral(this.props.token).format('0,0[.]00')}</h5>)

    return (
      <div className="pick">

        <div className="row">
          <div className={ isMobile ? "col-md-12 col-lg-8 no-padding" : "col-md-12 col-lg-8"}>
            <div className="detail card">
              <div className="card-body">
                <h4 className="title">{this.state.detail.main.title}</h4>

                {isMobile? (
                  <div className="detail_header">
                    <div>
                      <Countdown title="Contest Start" value={parseInt(this.state.detail.main.start)}/>
                      <h4>{getDateTime(this.state.detail.main.start)}</h4>
                    </div>
                    <div className="card">
                      <div className="card-body">
                        <h5>Fee: {this.renderFee(this.state.detail.main)}</h5>
                        <div className="row no-margin">
                          <h5 className="col-7 no-padding">Prizes: {sparlayFund()}{numeral(this.state.detail.main.total).format('0,0')}</h5>
                          <h5 className="col-5 no-padding">Sports: {sportImgs(this.state.detail.main.sports)}</h5>
                        </div>
                        <h5>Entrants: {this.state.detail.main.entrants} / {this.state.detail.main.entries}</h5>
                        <h5>Leagues: {this.state.detail.main.leagues}</h5>
                      </div>
                    </div>
                  </div>
                ):(
                  <Row>
                    <Col span={6}>
                      <Countdown title="Contest Start" value={parseInt(this.state.detail.main.start)}/>
                      <h4>{getDateTime(this.state.detail.main.start)}</h4>
                    </Col>
                    <Col span={18}>
                      <div className="card stats">
                        <div className="card-body">
                          <Row>
                            <Col span={15}>
                              <h5>Fee: {this.renderFee(this.state.detail.main)}</h5>
                              <h5>Entrants: {this.state.detail.main.entrants} / {this.state.detail.main.entries}</h5>
                            </Col>
                            <Col span={9}>
                              <h5>Prizes: {sparlayFund()}{numeral(this.state.detail.main.total).format('0,0')}</h5>
                              <h5>Sports: {sportImgs(this.state.detail.main.sports)}</h5>
                            </Col>
                          </Row>

                          <Row>
                            <Col span={24}>
                              <h5>Leagues: {this.state.detail.main.leagues}</h5>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}

                <div className="row buttons">
                  <Button className="m-button" onClick={this.showDetail}>Full Contest Details</Button>
                  <Button className="m-button" onClick={this.copyLink}>Copy Link</Button>
                </div>

              </div>
            </div>

            <div className="games card">
              <Games
                isMobile={isMobile}
                games={this.state.detail.games}
                picks={this.state.picks}
                pick={this.pick}
              />
            </div>
          </div>

          <div className={isMobile? "col-md-12 col-lg-4 no-padding":"col-md-12 col-lg-4"}>
            <div className="picks card">
              <div className="card-header">
                <h4 className="d-inline-block">Total Picks: {this.state.totalPicks} / {this.state.detail.games.length * 3}</h4>
              </div>
              <div className="card-body ">
                <List
                  dataSource={this.state.leaguePicks}
                  renderItem={ item => (
                      <List.Item>
                        <h5>{item.league} : {item.picked} / {item.games * 3}</h5>
                      </List.Item>
                  )} />
              </div>
            </div>

            <div className="intro card">
              <div className="card-body">
                <h4>How To Play</h4>

                <p>1) Select the Spread, Winner and Over/Under for each game.</p>
                <p>2) For every correct pick, you are awarded 1 point.</p>
                <p>3) When all games in the Contest have finished, users with the highest point totals win a percentage of the Total Prizes.</p>
                <p>4) Once you're made all of your picks, click the "ENTER" button below.</p>
                <p>5) Once the first game in the Contest has started, users will not be able to make any changes to their selections.</p>

                {this.state.operation == 'enter' ? (
                  <div className="row buttons">
                    {this.state.detail.main.currency == '1' || this.state.detail.main.currency == '2' ? (
                      <Button
                        className="m-button"
                        style={{width: 'unset'}}
                        onClick={this.enter.bind(this, '1')}
                        disabled={this.state.totalPicks < (this.state.detail.games.length * 3)}
                      >
                        <span>
                          ENTER<Divider type='vertical'/>
                          <label>{sparlayFund()}{numeral(this.state.detail.main.fee_cash).format('0,0')}</label>
                        </span>
                      </Button>
                    ):null}

                    {this.state.detail.main.currency == '0' || this.state.detail.main.currency == '2' ? (
                      <Button
                        className="m-button"
                        style={{width: 'unset'}}
                        onClick={this.enter.bind(this, '0')}
                        disabled={this.state.totalPicks < (this.state.detail.games.length * 3)}
                      >
                        <span>
                          ENTER<Divider type='vertical'/>
                          <label>{sparlayToken()}{numeral(this.state.detail.main.fee_token).format('0,0')}</label>
                        </span>
                      </Button>
                    ):null}
                  </div>
                ) : (
                  <div className="row buttons">
                    <Button
                      className="m-button"
                      style={{width: 'unset'}}
                      onClick={this.enter.bind(this, '5')}
                      disabled={this.state.totalPicks < (this.state.detail.games.length * 3)}
                    >
                      <span style={{width: '100px'}}>SAVE</span>
                    </Button>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>


        <Modal
            className={isMobile? "modal_detail modal_detail-m":"modal_detail"}
            visible={this.state.detail_visible}
            title={this.state.detail.main.title}
            onCancel={this.hideDetail}
            footer={[]}
        >
          {isMobile? (
            <div className="detail_header">
              <div>
                <Countdown title="Contest Start" value={parseInt(this.state.detail.main.start)}/>
                <h4>{getDateTime(this.state.detail.main.start)}</h4>
              </div>
              <div className="card">
                <div className="card-body">
                  <h5>Fee: {this.renderFee(this.state.detail.main)}</h5>
                  <div className="row no-margin">
                    <h5 className="col-7 no-padding">Prizes: {sparlayFund()}{numeral(this.state.detail.main.total).format('0,0')}</h5>
                    <h5 className="col-5 no-padding">Sports: {sportImgs(this.state.detail.main.sports)}</h5>
                  </div>
                  <h5>Entrants: {this.state.detail.main.entrants} / {this.state.detail.main.entries}</h5>
                  <h5>Leagues: {this.state.detail.main.leagues}</h5>
                </div>
              </div>
            </div>
          ):(
            <div className="detail_header">
              <Row>
                <Col span={6}>
                  <Countdown title="Contest Start" value={parseInt(this.state.detail.main.start)}/>
                  <h4>{getDateTime(this.state.detail.main.start)}</h4>
                </Col>
                <Col span={18}>
                  <div className="card">
                    <div className="card-body">
                      <Row>
                        <Col span={15}>
                          <h5>Fee: {this.renderFee(this.state.detail.main)}</h5>
                          <h5>Entrants: {this.state.detail.main.entrants} / {this.state.detail.main.entries}</h5>
                        </Col>
                        <Col span={9}>
                          <h5>Prizes: {sparlayFund()}{numeral(this.state.detail.main.total).format('0,0')}</h5>
                          <h5>Sports: {sportImgs(this.state.detail.main.sports)}</h5>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <h5>Leagues: {this.state.detail.main.leagues}</h5>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )}

          <Tabs className="tab" type="card" tabBarExtraContent={isMobile? null: balance}>
            <TabPane tab="Contest Details" key="1">
              <div className="row">
                <div className="col-lg-8 tab-content">
                  <div className="summary">
                    <h4>Summary</h4>
                    <div className="card">
                      <div className="card-body">
                        <p>
                          This {this.state.detail.main.entries} - user contest features
                          {sparlayFund()}{numeral(this.state.detail.main.total).format('0,0[.].00')} in total prizes and pays out the top
                          {' ' + this.state.detail.prizes[this.state.detail.prizes.length - 1].ed} finishing positions.
                          First place wins {sparlayFund()}{numeral(this.state.detail.prizes[0].prize).format('0,0[.].00')}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="entrant card">
                    <div className="card-header">
                      <div className="pull-right">
                        <Search
                          className="search"
                          placeholder="Search User"
                          value={this.state.search}
                          onChange={this.onSearch}
                          style={{ width: "200px"}}
                        />
                      </div>
                      <div className="utils__title">
                        <h4>Entrants</h4>
                      </div>
                    </div>

                    <div className="card-body">
                      <Table
                        bordered
                        columns={columns_entrant}
                        dataSource={this.state.entrants}
                        rowKey="index"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 tab-content">
                  <div className="payout">
                    <h4>Prize Payouts</h4>
                    <div className="card">
                      <div className="card-body">
                        <List
                          dataSource={this.state.detail.prizes}
                          renderItem={ prize => (
                            <List.Item>
                              {prize.st == prize.ed ? (
                                <h5>{numeral(prize.st).format('0o')}</h5>
                              ) : (
                                <h5>{numeral(prize.st).format('0o')} - {numeral(prize.ed).format('0o')}</h5>
                              )}
                              <h5 className="pull-right">{sparlayFund()} {numeral(prize.prize).format('0,0[.]00')}</h5>
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>

            <TabPane className="rule" tab="Rules & Scoring" key="2">
              <h4>Rules</h4>
              <div className="card">
                <div className="card-body">
                  <p>User must select the Spread, Moneyline and Over/Under for each game in the contest.</p>
                  <p>User may edit picks in the <Link to="/contest">Contests</Link> page until the first game starts.</p>
                  <p>If the contest does not fill up until the first game, the contest will be cancelled and, and all Entrants will be refunded the entry fee.</p>
                </div>
              </div>

              <h4>Scoring</h4>
              <div className="card">
                <div className="card-body">
                  <p>Users receive 1 point for each correct pick.</p>
                  <p>0 points are rewarded if there is a "PUSH".</p>
                  <p>When the final game of the contest ends, the top finishers will be will be credited according to the contest payout structure.</p>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Modal>


        <Modal
            className="modal_success"
            visible={this.state.success_visible}
            title=""
            footer={[]}
        >

          <h3>Congratulations, You're in!</h3>
          <p className="describe">Your picks were successfully entered into the {this.state.detail.main.title} contest!</p>

          <h4>Don't Stop Now!</h4>
          <p>View/edit your picks, or simply track your progress in <Link to="/contest">Contests</Link>!</p>
          <p>Return to the <Link to="/lobby">Lobby</Link> page to find other Sparlay Contests to join!</p>
          <p><Link to="/create">Create A Bet</Link> or search the <Link to="/open">Open Bets</Link> to increase your chances of winning large cash prizes!</p>
        </Modal>


        <Modal
          className={isMobile?"token_prompt token_prompt-m":"token_prompt"}
          visible={this.state.tokenPrompt}
          title=""
          onCancel={this.hideTokenPrompt}
          footer={[]}
        >
          <h3>Sorry!</h3>
          <p className="describe">You don't have the required number of {sparlayToken()} to enter this contest.</p>
          <p className="describe">
            Please return to the <Link to="/lobby">Lobby</Link> page
             to choose a different contest OR use your unique referral link below
            to revenue up to an additional {sparlayToken()}2,000.
          </p>

          <InputGroup compact className="link-group col-12 no-padding">
            <Input size="large" className="sharelink" disabled={true}
                   value={this.props.referral} style={{height: '42px'}} />
            <Button className="m-button"
                    onClick={this.shareLink}
            >
              Copy Link
            </Button>
          </InputGroup>
          <p className="describe">Receive 100 Sparlay Tokens for each referral!</p>
          <div className="icon-area">
            <a href="https://www.facebook.com/playsparlay/" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/facebook.png" alt=""/>
            </a>
            <a href="https://twitter.com/SparlayLLC" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/twitter.png" alt=""/>
            </a>
            <a href="https://www.instagram.com/playsparlay/" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/instergram.png" alt=""/>
            </a>
          </div>

        </Modal>


        <Modal
          className="membership_prompt"
          visible={this.state.membershipPrompt}
          title=""
          onCancel={this.hideMembershipPrompt}
          footer={[]}
        >

          <h3>Sorry!</h3>
          <p className="describe">This contest feature is only available for our VIP members.</p>
          <p className="describe">To subscribe for a Free one week trial of our VIP membership, click <a onClick={this.upgrade}>here</a>.</p>

          <h4>VIP Member Benefits</h4>
          <p>• Exclusive Written Contest</p>
          <p>• Contests</p>
          <p>• Customer Support Access</p>
          <p>• Game Simulator</p>
          <p>• Sparlay Data</p>
        </Modal>

      </div>
    )
  }
}

export default Pick
