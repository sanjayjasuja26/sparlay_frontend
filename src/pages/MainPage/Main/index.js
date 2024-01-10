import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import moment from 'moment'
import axios from 'axios'
import qs from 'qs'
import { setDialogState, setUserState, setSiteState } from 'ducks/app'
import { Games } from './Games'
import {
  sparlayToken,
  sparlayFund,
  sportImgs,
  getDateTime,
  copyLink,
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
  oddsData,
  cap,
} from 'siteGlobal/g'

import Menu from 'antd/lib/menu'
import DatePicker from 'antd/lib/date-picker'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Tag from 'antd/lib/tag'
import Divider from 'antd/lib/divider'
import Input from 'antd/lib/input'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Empty from 'antd/lib/empty'
import message from 'antd/lib/message'

import './style.scss'

const SubMenu = Menu.SubMenu
const MenuDivider = Menu.Divider
const InputGroup = Input.Group
const TabPane = Tabs.TabPane
const dateFormat = 'MM/DD/YYYY'

const mapStateToProps = ({ app }) => {
  const { siteState, userState, url, dialogState } = app
  return {
    url: url,
    userState: userState,
    referral: siteState.referral,
    store: siteState.store,
    msg: dialogState.msg,
  }
}

@connect(mapStateToProps)
class Main extends React.Component {
  state = {
    selectedKeys: '',
    openKeys: [''],
    past: [],
    up: [],
    active: [],
    menuData: [],

    games: [],

    opns: [],
    opn: [-1, -1],
    n: 0,

    straight: false,
    parlay: false,
    bet: {},
    obet: {},
    parlay_bets: [],
    oparlay_bets: [],
    curDate: moment(new Date(), dateFormat),
  }

  shareLink = () => {
    if (this.props.userState.user_id === '') {
      this.props.dispatch(setDialogState({ loginPrompt: true }))
      return
    }

    copyLink(this.props.referral)
    message.success('Copied!')
  }

  onDate = (m, str) => {
    let cd = new Date()
    if (m === null) {
      this.fetchGames(cd.getTime(), 'all')
      this.setState({ curDate: moment(new Date(), dateFormat) })
    } else {
      let d = new Date(str)
      if (d.getTime() >= cd.getTime()) {
        this.fetchGames(d.getTime(), 'date')
        this.setState({ curDate: m })
      } else {
        this.fetchGames(cd.getTime(), 'all')
        this.setState({ curDate: moment(new Date(), dateFormat) })
      }
    }
  }

  //******************************* Opn *******************************//

  acceptOpn = n => {
    var { dispatch, userState } = this.props

    var { opn, opns } = this.state
    let t = opns[opn[n]]

    if (userState.user_id == '') {
      this.setState({ openBet: false, parlay: false })
      dispatch(setDialogState({ loginPrompt: true }))
      return
    }
    if (t.currency == '1') {
      if (userState.vip == '1') {
        dispatch(setDialogState({ membershipPrompt: true }))
        return
      }
      if (parseFloat(userState.cash) < parseFloat(t.fee)) {
        dispatch(setDialogState({ cashPrompt: true }))
        return
      }
    } else if (t.currency == '0') {
      if (parseFloat(userState.token) < parseFloat(t.fee)) {
        dispatch(setDialogState({ tokenPrompt: true }))
        return
      }
    }

    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/accept/v2',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({
        user_id: userState.user_id,
        t_id: t.id,
      }),
    })
      .then(function(res) {
        _this.setState({
          straight: false,
          parlay: false,
        })
        if (res.data.res == 'success') {
          userState.token = res.data.balance.token
          userState.cash = res.data.balance.cash
          dispatch(setUserState({ userState: userState }))
          message.success('Succeeded to Accept Bet!')
          _this.fetchBets()
        } else if (res.data.res == 'fail') {
          if (res.data.err == 'already') {
            message.error('Already Accepted Bet!')
          }
        }
      })
      .catch(function(err) {
        _this.setState({
          straight: false,
          parlay: false,
        })
        console.log('???/Main : acceptOpn >', err)
      })

    if (n == 0) opn[0] = opn[1]
    if (opn[1] > 0) opn[1] += 1

    for (let ii in opn) {
      if (opn[ii] >= opns.length) opn[ii] = -1
    }

    this.setState({ opn: opn })
  }

  declineOpn = n => {
    let opn = this.state.opn

    if (n == 0) opn[0] = opn[1]
    if (opn[1] > 0) opn[1] += 1

    for (let ii in opn) {
      if (opn[ii] >= this.state.opns.length) opn[ii] = -1
    }
    this.setState({
      straight: false,
      parlay: false,
      opn: opn,
    })
  }

  prevOpn = () => {
    let opn = this.state.opn
    if (opn[0] > 0) {
      opn[1] = opn[0]
      opn[0] -= 1

      for (let ii in opn) {
        if (opn[ii] >= this.state.opns.length) opn[ii] = -1
      }

      this.setState({ opn: opn })
    }
  }

  nextOpn = () => {
    let opn = this.state.opn
    if (opn[1] > 0) {
      opn[0] = opn[1]
      opn[1] += 1

      for (let ii in opn) {
        if (opn[ii] >= this.state.opns.length) opn[ii] = -1
      }

      this.setState({ opn: opn })
    }
  }

  viewOpn = i => {
    let { opn, opns } = this.state
    this.setState({ n: i })
    let obet = opns[opn[i]]
    let bet = getOpponent(obet)
    obet.teamData = teamData(obet.bet_type, obet.team, obet.point)

    this.setState({
      bet: bet,
      obet: obet,
      parlay_bets: [],
      oparlay_bets: [],
    })

    if (bet.type == 'Parlay') {
      this.getParlay(bet.id)
      this.setState({ parlay: true })
    } else {
      this.setState({ straight: true })
    }
  }

  //******************************* My Bets *******************************//

  getSports = sport => {
    let sports = sport.split(', ')
    let result = ''
    for (let s of sports) result += cap(s) + ' '

    return result
  }

  getItemData = bet => {
    let data = (
      <div>
        {renderCurrency(bet.currency, bet.win)}, {bet.type}, {this.getSports(bet.sport)} {bet.odds},{' '}
        {getDateTime(bet.utc)}
      </div>
    )
    return data
  }

  genPast = (range, past) => {
    let items = []

    if (past.length === 0) {
      items.push({ title: 'No past bets', key: 'past-no', des: '1' })
    } else {
      for (let i = 0; i < past.length; i++) {
        if (i > 4 && range === 'less') break
        let itemData = {
          title: this.getItemData(past[i]),
          key: 'past_' + i,
        }
        items.push(itemData)
      }
      if (past.length > 5) {
        if (range === 'less') items.push({ title: 'More', key: 'past-more', action: '1' })
        else items.push({ title: 'Less', key: 'past-less', action: '1' })
      }
    }

    return items
  }

  genUp = (range, up) => {
    let items = []

    if (up.length === 0) {
      items.push({ title: 'No upcoming bets', key: 'up-no', des: '1' })
    } else {
      for (let i = 0; i < up.length; i++) {
        if (i > 4 && range === 'less') break

        let itemData = {
          title: this.getItemData(up[i]),
          key: 'up_' + i,
          index: i,
        }
        items.push(itemData)
      }
      if (up.length > 5) {
        if (range === 'less') items.push({ title: 'More', key: 'up-more', action: '1' })
        else items.push({ title: 'Less', key: 'up-less', action: '1' })
      }
    }

    return items
  }

  genActive = (range, active) => {
    var items = []

    if (active.length === 0) {
      items.push({ title: 'No active bets', key: 'active-no', des: '1' })
    } else {
      for (let i = 0; i < active.length; i++) {
        if (i > 4 && range === 'less') break
        let itemData = {
          title: this.getItemData(active[i]),
          key: 'active_' + i,
          index: i,
        }
        items.push(itemData)
      }
      if (active.length > 5) {
        if (range === 'less') items.push({ title: 'More', key: 'active-more', action: '1' })
        else items.push({ title: 'Less', key: 'active-less', action: '1' })
      }
    }

    return items
  }

  handleClick = e => {
    var { menuData, past, up, active } = this.state
    var skey = e.key
    if (skey.includes('more')) {
      if (skey.includes('past')) menuData[0].children = this.genPast('more', past)
      else if (skey.includes('up')) menuData[2].children = this.genUp('more', up)
      else if (skey.includes('active')) menuData[4].children = this.genActive('more', active)
    } else if (skey.includes('less')) {
      if (skey.includes('past')) menuData[0].children = this.genPast('less', past)
      else if (skey.includes('up')) menuData[2].children = this.genUp('less', up)
      else if (skey.includes('active')) menuData[4].children = this.genActive('less', active)
    } else if (skey.includes('_')) {
      let ss = skey.split('_')
      let index = parseInt(ss[1], 10)

      if (skey.includes('past')) this.viewBet(past[index])
      else if (skey.includes('up')) this.viewBet(up[index])
      else if (skey.includes('active')) this.viewBet(active[index])
    }

    this.setState({
      menuData: menuData,
      selectedKeys: e.key,
    })
  }

  onOpenChange = openKeys => {
    var newKeys = ['']
    if (openKeys.length > 1) {
      newKeys.push(openKeys[openKeys.length - 1])
    }

    this.setState({
      openKeys: newKeys,
    })
  }

  generateMenuPartitions(items) {
    return items.map(menuItem => {
      if (menuItem.children) {
        let subMenuTitle = (
          <span className="menuLeft__title-wrap" key={menuItem.key}>
            <img className="menuLeft__item-icon" src="resources/images/bethand.png" alt="" />
            <span className="menuLeft__item-dot"></span>
            <span className="menuLeft__item-title">{menuItem.title}</span>
            {menuItem.icon && <span className={menuItem.icon + ' menuLeft__icon'} />}
          </span>
        )
        return (
          <SubMenu title={subMenuTitle} key={menuItem.key}>
            {this.generateMenuPartitions(menuItem.children)}
          </SubMenu>
        )
      }
      return this.generateMenuItem(menuItem)
    })
  }

  generateMenuItem(item) {
    const { key, title, url, icon, disabled } = item
    const { dispatch } = this.props
    return item.divider ? (
      <MenuDivider key={Math.random()} />
    ) : item.type ? (
      <Menu.Item key={key} disabled={disabled}>
        <span className="menuLeft__item-title">{title}</span>
        {icon && <span className={icon + ' menuBets__icon'} />}
      </Menu.Item>
    ) : item.des ? (
      <Menu.Item key={key} disabled={disabled}>
        <span className="menuDes__item-title">{title}</span>
      </Menu.Item>
    ) : item.action ? (
      <Menu.Item key={key} disabled={disabled}>
        <span className="menuAction__item-title">{title}</span>
      </Menu.Item>
    ) : (
      <Menu.Item key={key} disabled={disabled}>
        <label className="menuBets__item-title">{title}</label>
      </Menu.Item>
    )
  }

  //******************************* Modal *******************************//

  viewBet = bet => {
    bet.teamData = teamData(bet.bet_type, bet.team, bet.point)
    this.setState({ parlay_bets: [], oparlay_bets: [] })

    this.setState({ bet: bet, obet: getOpponent(bet) })

    if (bet.type == 'Parlay') {
      this.getParlay(bet.id)
      this.setState({ parlay: true })
    } else {
      this.setState({ straight: true })
    }
  }

  getParlay = t_id => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/parlay',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ t_id: t_id }),
    })
      .then(function(res) {
        if (res.data.res === 'success') {
          let bets = res.data.bets,
            parlay_bets = [],
            oparlay_bets = []
          for (let bet of bets) {
            let obet = cloneHash(bet)
            if (bet.type == 'O/U') {
              if (bet.team == 'Over') obet.team = 'Under'
              else obet.team = 'Over'
            } else {
              if (bet.team == bet.team1) obet.team = bet.team2
              else obet.team = bet.team1
            }

            obet.odds = formatOdds(-parseInt(bet.odds))
            obet.point = -parseFloat(bet.point)
            if (obet.point != 0) obet.point = formatPoint(obet.point)
            parlay_bets.push(bet)
            oparlay_bets.push(obet)
          }

          _this.setState({
            parlay_bets: parlay_bets,
            oparlay_bets: oparlay_bets,
          })
        }
      })
      .catch(function(err) {
        console.log(err)
      })
  }

  straightHide = () => {
    this.setState({ straight: false })
  }

  parlayHide = () => {
    this.setState({ parlay: false })
  }

  //******************************* Component ***************************//

  fetchBets = () => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/user_bets',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id }),
    })
      .then(res => {
        if (res.data.res === 'success') {
          let past = res.data.bets.past,
            up = res.data.bets.up,
            active = res.data.bets.active
          let pastItems = [],
            upItems = [],
            activeItems = []

          if (past.length === 0) pastItems.push({ title: 'No past bets', key: 'past-no', des: '1' })
          else pastItems = _this.genPast('less', past)

          if (up.length === 0) upItems.push({ title: 'No upcoming bets', key: 'up-no', des: '1' })
          else upItems = _this.genUp('less', up)

          if (active.length === 0)
            activeItems.push({ title: 'No active bets', key: 'active-no', des: '1' })
          else activeItems = _this.genActive('less', active)

          let menuData = [
            {
              title: 'Past Bets',
              key: 'past',
              children: pastItems,
              type: 'category',
            },
            {
              divider: true,
            },
            {
              title: 'Upcoming Bets',
              key: 'upcoming',
              children: upItems,
              type: 'category',
            },
            {
              divider: true,
            },
            {
              title: 'Active Bets',
              key: 'active',
              children: activeItems,
              type: 'category',
            },
          ]

          _this.setState({
            past: past,
            up: up,
            active: active,
            menuData: menuData,
          })
        }
      })
      .catch(err => {
        console.log('???/Main : fetchBets >', err)
      })
  }

  fetchGames = (tm, option) => {
    const _this = this
    const postData = {
      date: tm,
      option: option,
    }
    axios({
      method: 'post',
      url: this.props.url + '/game/upcoming',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(postData),
    })
      .then(function(res) {
        if (res.data.res === 'fail') {
          console.log('Failed to Fetch Odds:')
          console.log(res.data.err)
          return false
        } else if (res.data.res === 'success') {
          _this.setState({ games: res.data.games })
          return true
        }
      })
      .catch(function(error) {
        console.log('***/Main : fetchGames >', error)
      })
  }

  fetchOpn = () => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/suggest/open',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({ user_id: this.props.userState.user_id }),
    })
      .then(function(res) {
        if (res.data.res == 'success') {
          let opn = [0, 1],
            opns = res.data.bets
          if (opns.length < 1) {
            opn = [-1, -1]
          } else if (opns.length < 2) {
            opn = [0, -1]
          }
          _this.setState({
            opns: opns,
            opn: opn,
          })
        }
      })
      .catch(function(error) {
        console.log('???/Main : fetchOpn >', error)
      })
  }

  componentDidMount() {
    if (this.props.store.page == '/main') {
      this.setState(this.props.store.data)
      const { dispatch } = this.props
      dispatch(
        setSiteState({
          store: {
            page: '',
            data: {},
          },
        }),
      )
    } else {
      let d = new Date()
      this.fetchGames(d.getTime(), 'all')
      this.fetchOpn()
      this.fetchBets()
    }
  }

  componentWillReceiveProps(newProps) {
    const { msg } = newProps
    if (msg == '') return

    const { dispatch } = this.props

    dispatch(setDialogState({ msg: '' }))
    dispatch(
      setSiteState({
        store: {
          page: '/main',
          data: this.state,
        },
      }),
    )
    window.localStorage.setItem(
      'sparlay.userStore',
      JSON.stringify({
        page: '/main',
        data: this.state,
      }),
    )

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
    const { bet, obet, opn, opns, menuData, selectedKeys, openKeys } = this.state
    const params = { breakpoint: 'lg' }

    return (
      <div className="m-main">
        <div className="row">
          <div className={isMobile ? 'col-md-12 col-lg-8 no-padding' : 'col-md-12 col-lg-8'}>
            <div className="opns card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/sparlay_logo_big.png" alt="" />
                  <h4 className="d-inline-block">Largest Potential Winning Bets</h4>
                </div>
              </div>

              <div className="card-body">
                <Row>
                  <Col span={1}>
                    <Button className="btn-arrow" icon="left" onClick={this.prevOpn} />
                  </Col>
                  {opn.map((oi, index) => {
                    if (isMobile && index > 0) {
                      return null
                    }
                    let bet
                    if (oi >= 0) {
                      bet = getOpponent(opns[oi])
                    }
                    return (
                      <Col span={isMobile ? 22 : 11} key={index}>
                        <div className="opn">
                          {oi < 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          ) : (
                            <div className="opn-detail">
                              <div
                                style={{ cursor: 'pointer', borderBottom: '1px solid #eef0f4' }}
                                onClick={this.viewOpn.bind(this, index)}
                              >
                                <Row>
                                  <Col span={9}>
                                    <p>Sport: {sportImgs(bet.sport)}</p>
                                  </Col>
                                  <Col span={9}>
                                    <p>
                                      Bet Type:{' '}
                                      <label>
                                        {bet.type == 'Parlay' ? 'Parlay' : bet.bet_type}
                                      </label>
                                    </p>
                                  </Col>
                                  <Col span={6}>
                                    <p>
                                      Odds: <label>{bet.odds}</label>
                                    </p>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <p>
                                      Live: <label>{getDateTime(bet.utc)}</label>
                                    </p>
                                  </Col>
                                  <Col span={15}>
                                    <p>
                                      Bet:{' '}
                                      <label>{bet.type == 'Parlay' ? 'Parlay' : bet.team}</label>
                                    </p>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <p>
                                      Fee: <label>{renderCurrency('1', bet.fee)}</label>
                                    </p>
                                  </Col>
                                  <Col span={15}>
                                    <p>
                                      Winnings: <label>{renderCurrency('1', bet.win)}</label>
                                    </p>
                                  </Col>
                                </Row>
                              </div>

                              <div className="row buttons">
                                <Button
                                  className="r-button"
                                  onClick={this.declineOpn.bind(this, index)}
                                >
                                  Decline Bet
                                </Button>
                                <Button
                                  className="g-button"
                                  onClick={this.acceptOpn.bind(this, index)}
                                >
                                  Accept Bet
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    )
                  })}
                  <Col span={1}>
                    <Button className="btn-arrow" icon="right" onClick={this.nextOpn} />
                  </Col>
                </Row>
              </div>
            </div>

            {isMobile ? (
              <div className="col-md-12 col-lg-4 no-padding">
                <div className="refer card refer-m">
                  <div className="card-body">
                    <div className="fire-box">
                      <img className="fire" src="resources/images/fire.png" alt="" />
                    </div>
                    <h1>GET AN EXTRA 2,000 TOKENS FOR REFERRALS THIS WEEK</h1>
                    <h4>Share our referral link with your friends!</h4>
                    <InputGroup compact className="link-group col-12">
                      <Input
                        size="large"
                        className="sharelink"
                        disabled={true}
                        value={this.props.referral}
                        style={{ height: '42px' }}
                      />
                      <Button
                        className="m-button"
                        style={{ width: '100px' }}
                        onClick={this.shareLink}
                      >
                        Copy Link
                      </Button>
                    </InputGroup>
                    <h5>Receive 100 Sparlay Tokens for each referral!</h5>
                    <div className="icon-area">
                      <a
                        href="https://twitter.com/SparlayLLC"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img className="link-icon" src="resources/images/twitter.png" alt="" />
                      </a>
                      <a
                        href="https://www.instagram.com/playsparlay/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img className="link-icon" src="resources/images/instagram.png" alt="" />
                      </a>
                      <a
                        href="https://www.facebook.com/playsparlay/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img className="link-icon" src="resources/images/facebook.png" alt="" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bets card">
                  <div className="card-header">
                    <div className="bets__title utils__title">
                      <h4 className="d-inline-block">Your Bets</h4>
                    </div>
                  </div>
                  <div className="card-body ">
                    <div {...params} className="menuBets">
                      <Menu
                        theme={'light'}
                        onClick={this.handleClick}
                        selectedKeys={[selectedKeys]}
                        openKeys={openKeys}
                        onOpenChange={this.onOpenChange}
                        mode="inline"
                        className="menuBets__navigation"
                      >
                        {this.generateMenuPartitions(menuData)}
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="games card">
              <div className="card-header">
                <div className="pull-right mt-1">
                  <DatePicker
                    format={dateFormat}
                    value={this.state.curDate}
                    dateRender={current => {
                      const style = {}
                      if (current.date() === 1) {
                        style.border = '1px solid #1890ff'
                        style.borderRadius = '50%'
                      }
                      return (
                        <div className="ant-calendar-date" style={style}>
                          {current.date()}
                        </div>
                      )
                    }}
                    onChange={this.onDate}
                  />
                </div>
                <div className="games__title utils__title">
                  <h4>Upcoming Games</h4>
                </div>
                <div className="des">
                  <label>Suggested Odds and Lines</label>
                </div>
              </div>
              <Games games={this.state.games} isMobile={isMobile} />
            </div>
          </div>

          {!isMobile ? (
            <div className="col-md-12 col-lg-4">
              <div className="bets card">
                <div className="card-header">
                  <div className="bets__title utils__title">
                    <h4 className="d-inline-block">Your Bets</h4>
                  </div>
                </div>
                <div className="card-body ">
                  <div {...params} className="menuBets">
                    <Menu
                      theme={'light'}
                      onClick={this.handleClick}
                      selectedKeys={[selectedKeys]}
                      openKeys={openKeys}
                      onOpenChange={this.onOpenChange}
                      mode="inline"
                      className="menuBets__navigation"
                    >
                      {this.generateMenuPartitions(menuData)}
                    </Menu>
                  </div>
                </div>
              </div>

              <div className="refer card">
                <div className="card-body">
                  <div className="fire-box">
                    <img className="fire" src="resources/images/fire.png" alt="" />
                  </div>
                  <h1>GET AN EXTRA 2,000 TOKENS FOR REFERRALS THIS WEEK</h1>
                  <h4>Share our referral link with your friends!</h4>
                  <InputGroup compact className="link-group col-12">
                    <Input
                      size="large"
                      className="sharelink"
                      disabled={true}
                      value={this.props.referral}
                      style={{ height: '42px' }}
                    />
                    <Button
                      className="m-button"
                      style={{ width: '100px' }}
                      onClick={this.shareLink}
                    >
                      Copy Link
                    </Button>
                  </InputGroup>
                  <h5>Receive 100 Sparlay Tokens for each referral!</h5>
                  <div className="icon-area">
                    <a
                      href="https://twitter.com/SparlayLLC"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img className="link-icon" src="resources/images/twitter.png" alt="" />
                    </a>
                    <a
                      href="https://www.instagram.com/playsparlay/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img className="link-icon" src="resources/images/instagram.png" alt="" />
                    </a>
                    <a
                      href="https://www.facebook.com/playsparlay/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img className="link-icon" src="resources/images/facebook.png" alt="" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Modal
          className={obet.accept != '0' ? 'actview-straight no-footer' : 'actview-straight'}
          visible={this.state.straight}
          title={renderOverviewTitle(bet.accept)}
          onCancel={this.straightHide}
          footer={[
            <Button
              key="1"
              className="decline pull-left"
              onClick={this.declineOpn.bind(this, this.state.n)}
            >
              Decline Bet
            </Button>,
            <Button key="2" className="accept" onClick={this.acceptOpn.bind(this, this.state.n)}>
              Accept Bet
            </Button>,
          ]}
        >
          <Tabs className={isMobile ? 'tab-m' : 'tab'} onChange={key => {}}>
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
                <div className="field__value pull-right">
                  {renderCurrency(bet.currency, bet.bet)}
                </div>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <div className="field__value pull-right">
                  {renderCurrency(bet.currency, bet.win)}
                </div>
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

          {obet.accept != '0' ? (
            <div className="field" style={{ border: '0px', textAlign: 'center' }}>
              {renderBetResult(bet.result)}
            </div>
          ) : null}
        </Modal>

        <Modal
          className={obet.accept != '0' ? 'actview-parlay no-footer' : 'actview-parlay'}
          visible={this.state.parlay}
          title={renderOverviewTitle(bet.accept)}
          onCancel={this.parlayHide}
          footer={[
            <Button
              key="1"
              className="decline pull-left"
              onClick={this.declineOpn.bind(this, this.state.n)}
            >
              Decline Bet
            </Button>,
            <Button key="2" className="accept" onClick={this.acceptOpn.bind(this, this.state.n)}>
              Accept Bet
            </Button>,
          ]}
        >
          <Tabs className={isMobile ? 'tab-m' : 'tab'} onChange={key => {}}>
            <TabPane tab="My Bet" key="1">
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{bet.type}</label>
              </div>
              <div className="field" style={{ padding: '12px 16px 12px' }}>
                {this.state.parlay_bets.map((bet, index) => (
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">{bet.league}</label>
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
                      <label className="field2__value pull-right">
                        {oddsData(bet.type, bet.point, bet.odds)}
                      </label>
                    </div>
                    {index < this.state.parlay_bets.length - 1 ? (
                      <Divider>
                        {bet.accept == -1 ? (
                          <Tag className="tag-condition" color="#eec201">
                            AND
                          </Tag>
                        ) : (
                          <Tag className="tag-condition" color="#eec201">
                            OR
                          </Tag>
                        )}
                      </Divider>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{bet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <label className="field__value pull-right">
                  {renderCurrency(bet.currency, bet.bet)}
                </label>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <label className="field__value pull-right">
                  {renderCurrency(bet.currency, bet.win)}
                </label>
              </div>
            </TabPane>

            <TabPane tab="Their Bet" key="2">
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{obet.type}</label>
              </div>
              <div className="field" style={{ padding: '12px 16px 12px' }}>
                {this.state.oparlay_bets.map((bet, index) => (
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">{bet.league}</label>
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
                      <label className="field2__value pull-right">
                        {oddsData(bet.type, bet.point, bet.odds)}
                      </label>
                    </div>
                    {index < this.state.oparlay_bets.length - 1 ? (
                      <Divider>
                        {obet.accept == -1 ? (
                          <Tag className="tag-condition" color="#eec201">
                            AND
                          </Tag>
                        ) : (
                          <Tag className="tag-condition" color="#eec201">
                            OR
                          </Tag>
                        )}
                      </Divider>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="field">
                <label className="field__title">Odds</label>
                <label className="field__value pull-right">{obet.odds}</label>
              </div>
              <div className="field">
                <label className="field__title">Entry Fee</label>
                <label className="field__value pull-right">
                  {renderCurrency(obet.currency, obet.bet)}
                </label>
              </div>
              <div className="field">
                <label className="field__title">Potential Winnings</label>
                <label className="field__value pull-right">
                  {renderCurrency(bet.currency, bet.win)}
                </label>
              </div>
            </TabPane>
          </Tabs>

          {obet.accept != '0' ? (
            <div className="field" style={{ border: '0px', textAlign: 'center' }}>
              {renderBetResult(bet.result)}
            </div>
          ) : null}
        </Modal>
      </div>
    )
  }
}

export default Main
