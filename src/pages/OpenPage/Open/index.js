import React from 'react'
import { connect } from 'react-redux'
import { push } from "react-router-redux"
import axios from 'axios'
import qs from 'qs'
import { setDialogState, setUserState, setSiteState } from 'ducks/app'
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
  invalidLocation
} from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio'
import Table from 'antd/lib/table'
import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Tag from 'antd/lib/tag'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Divider from 'antd/lib/divider'
import Tooltip from 'antd/lib/tooltip'
import Drawer from 'antd/lib/drawer'
import message from 'antd/lib/message'

import './style.scss'

const InputGroup = Input.Group
const Search = Input.Search
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const TabPane = Tabs.TabPane

const mapStateToProps = ({ app }) => {
  const { userState , url, siteState, dialogState } = app
  return {
    url: url,
    userState: userState,
    referral: siteState.referral,
    store: siteState.store,
    msg: dialogState.msg,
  }
}


@connect(mapStateToProps)
class Open extends React.Component {

  state = {
    filterDrawer: false,
    sortedInfo: {},

    searchWord: '',
    searchCat: 'open',
    searchType: 'all',
    searchBet: 'all',
    searchCurrency: 'all',
    searchFeeMin: '',
    searchFeeMax: '',
    searchWinMin: '',
    searchWinMax: '',

    bets: [],

    straight: false,
    parlay: false,
    cancelConfirm: false,

    bet: {},
    obet: {},
    parlay_bets: [],
    oparlay_bets: [],

    oddsWarning: false
  }


//****************************** Search ******************************//

  onSearchChange = (e) => {
    this.setState({
      searchWord: e.target.value,
    })
  }

  onSearch = (v) => {
    this.setState({
      searchWord: v,
    }, this.search)
  }

  onResetFilters = () => {
    this.setState({
      searchWord: '',
      searchCat: 'open',
      searchType: 'all',
      searchBet: 'all',
      searchCurrency: 'all',
      searchFeeMin: '',
      searchFeeMax: '',
      searchWinMin: '',
      searchWinMax: '',

      sortedInfo: {},
      filterDrawer: false,
    }, this.search)
  }

  onRadioCat = (e) => {
    this.setState({
      searchCat: e.target.value
    }, this.search)
  }

  onType = (v) => {
    let { searchBet } = this.state
    if (this.state.searchType == v) {
      v = 'all'
      searchBet = 'all'
    }
    if (v == 'Parlay') searchBet = 'all'
    this.setState({
      searchType: v,
      searchBet: searchBet
    }, this.search)
  }

  onBet = (v) => {
    if (this.state.searchBet == v) {
      this.setState({
        searchType: 'all',
        searchBet: 'all'
      }, this.search)
      return
    }
    this.setState({
      searchType: 'Straight',
      searchBet: v
    }, this.search)
  }

  onCurrency = (v) => {
    if (this.state.searchCurrency == v) v = 'all'
    this.setState({
      searchCurrency: v
    }, this.search)
  }

  onInputRange = (key, e) => {
    // let v = formatNumber(e.target.value)
    let v = e.target.value

    switch (key) {
      case 'fee_min':
        this.setState({searchFeeMin: v})
        break
      case 'fee_max':
        this.setState({searchFeeMax: v})
        break
      case 'win_min':
        this.setState({searchWinMin: v})
        break
      case 'win_max':
        this.setState({searchWinMax: v})
        break
      default:
        break
    }
  }


  search = () => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/search/open',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({
        user_id: this.props.userState.user_id,
        username: this.state.searchWord,
        cat: this.state.searchCat,
        type: this.state.searchType,
        bet_type: this.state.searchBet,
        currency: this.state.searchCurrency,
        fee_min: this.state.searchFeeMin,
        fee_max: this.state.searchFeeMax,
        win_min: this.state.searchWinMin,
        win_max: this.state.searchWinMax
      })
    })
    .then(function (res) {
      if (res.data.res === 'fail'){
        console.log('Failed to Fetch all bets:')
        console.log(res.data.err)
      } else if (res.data.res === 'success'){
        _this.setState({ bets: res.data.bets })
      }
    })
    .catch(function (err) {
      console.log(err)
    })
  }


//******************************* Modal *******************************//

  overview = (bet) => {
    bet.teamData = teamData(bet.bet_type, bet.team, bet.point)
    this.setState({ parlay_bets: [], oparlay_bets: [] })

    if (bet.u_id == this.props.userState.user_id) {
      this.setState({ bet: bet, obet: getOpponent(bet) })
    } else {
      this.setState({ obet: bet, bet: getOpponent(bet) })
    }

    if (bet.type == 'Parlay') {
      this.getParlay(bet.id)
      this.setState({ parlay: true })
    } else {
      this.setState({ straight: true })
    }
  }


  straightOK = () => {
    if (this.state.searchCat == 'my_open' || this.state.searchCat == 'challenge') {
      this.setState({straight: false})
    } else {
      if (Math.abs(parseInt(this.state.bet.odds)) > 500) {
        this.setState({oddsWarning: true})
      } else {
        this.acceptBet()
      }
    }
  }

  straightCancel = () => {
    if (this.state.searchCat == 'my_open' || this.state.searchCat == 'challenge') {
      this.setState({ cancelConfirm: true })
    }else{
      this.setState({straight: false})
    }
  }

  straightHide = () => {
    this.setState({straight: false})
  }


  parlayOK = () => {
    if (this.state.searchCat == 'my_open' || this.state.searchCat == 'challenge') {
      this.setState({parlay: false})
    }else{
      if (Math.abs(parseInt(this.state.bet.odds)) > 500) {
        this.setState({oddsWarning: true})
      } else {
        this.acceptBet()
      }
    }
  }

  parlayCancel = () => {
    if (this.state.searchCat == 'my_open' || this.state.searchCat == 'challenge') {
      this.setState({ cancelConfirm: true })
    }else{
      this.setState({parlay: false})
    }
  }

  parlayHide = () => {
    this.setState({parlay: false})
  }


  cancelYes = () => {
    var { dispatch , userState, url } = this.props

    const _this = this
    let postData = {
      user_id: userState.user_id,
      t_id: this.state.bet.id,
    }
    axios({
      method: 'post',
      url: url + '/bet/cancel',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify(postData),
    })
      .then(function (res) {
        if (res.data.res == 'success'){
          userState.token = res.data.balance.token
          userState.cash = res.data.balance.cash
          dispatch(setUserState({ userState: userState }))
          message.success('Bet successfully cancelled!')
          _this.search()
        } else if (res.data.res == 'fail'){
          if (res.data.err == 'accepted') {
            message.error('Bet already accepted!')
            _this.search()
          }
        }
      })
      .catch(function (error) {
        console.log(error)
      })

    this.setState({
      straight: false,
      parlay: false,
      cancelConfirm: false,
    })
  }

  cancelNo = () => {
    this.setState({ cancelConfirm: false })
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
          if (_this.state.bet.u_id == _this.props.userState.user_id) {
            _this.setState({
              parlay_bets: parlay_bets,
              oparlay_bets: oparlay_bets,
            })
          } else {
            _this.setState({
              parlay_bets: oparlay_bets,
              oparlay_bets: parlay_bets,
            })
          }
        }
      })
      .catch(function (err) {
        console.log(err)
      })
  }

  acceptBet = () => {
    var { dispatch , userState } = this.props

    if (userState.user_id === '') {
      // this.setState({ openBet: false, parlay: false })
      dispatch(setDialogState({ loginPrompt: true }))
      return
    }

    if (this.state.currency != '0') {
      if (invalidLocation()) {
        dispatch(setDialogState({ locationPrompt: true }))
        return
      }
    }

    if (this.state.bet.currency != '1') {
      if (parseFloat(userState.token) < parseFloat(this.state.bet.fee)) {
        // this.setState({ openBet: false, parlay: false })
        dispatch(setDialogState({ tokenPrompt: true }))
        return
      }
    }
    if (this.state.bet.currency != '0'){
      if (parseFloat(userState.cash) < parseFloat(this.state.bet.fee)) {
        // this.setState({ openBet: false, parlay: false })
        dispatch(setDialogState({ cashPrompt: true }))
        return
      }
    }

    const _this = this
    var postData = {
      user_id: userState.user_id,
      t_id: this.state.bet.id,
      // bets: this.state.parlay_bets
    }
    axios({
      method: 'post',
      url: this.props.url + '/bet/accept/v2',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(postData),
    })
      .then(function (res) {
        if (res.data.res == 'success'){
          userState.token = res.data.balance.token
          userState.cash = res.data.balance.cash
          dispatch(setUserState({ userState: userState }))
          message.success('Bet successfully accepted!')
          _this.setState({ straight: false, parlay: false })
          _this.search()
        } else if (res.data.res == 'fail'){
          if (res.data.err == 'accepted') {
            message.error('Bet already accepted!')
            _this.setState({ straight: false, parlay: false })
            _this.search()
          } else if (res.data.err == 'cash') {
            dispatch(setDialogState({ cashPrompt: true }))
          } else if (res.data.res == 'token') {
            dispatch(setDialogState({ tokenPrompt: true }))
          }
        }
      })
      .catch(function (err) {
        console.log(err)
      })
  }


  warningOk = () => {
    this.setState({oddsWarning: false})
    this.acceptBet()
  }

  warningCancel = () => {
    this.setState({oddsWarning: false})
  }


//******************************* Drawer ******************************//

  showDrawer = () => {
    this.setState({ filterDrawer: true })
  }

  closeDrawer = () => {
    this.setState({ filterDrawer: false })
  }

  onSearchDrawer = (v) => {
    this.setState({
      searchWord: v,
      filterDrawer: false,
    }, this.search)
  }

  onChangeDrawer = (e) => {
    this.setState({
      searchWord: e.target.value,
    })
  }


//******************************* component ******************************//

  shareLink = () => {
    if (this.props.userState.user_id === '') {
      this.props.dispatch(setDialogState({ loginPrompt: true }))
      return
    }

    copyLink(this.props.referral)
    message.success('Copied!')
  }

  sortTable = (pagination, filters, sorter) => {
    this.setState({ sortedInfo: sorter })
  }

  componentDidMount() {
    if (this.props.store.page == '/open') {
      this.setState(this.props.store.data)
      const { dispatch } = this.props
      dispatch(setSiteState({
        store: {
          page: '',
          data: {}
        }
      }))
    } else {
      this.search()
    }
  }

  componentWillReceiveProps(newProps) {
    const { msg } = newProps
    if (msg == '') return

    const { dispatch } = this.props

    dispatch(setDialogState({ msg: '' }))
    dispatch(setSiteState({
      store: {
        page: '/open',
        data: this.state
      }
    }))
    window.localStorage.setItem('sparlay.userStore', JSON.stringify({
      page: '/open',
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
    const { isMobile, userState } = this.props
    var { sortedInfo, bet, obet } = this.state
    var columns = [
      {
        title: 'Sport',
        dataIndex: 'sport',
        className: 'col-left col-sport',
        render: (sport, bet) => {
          return (sportImgs(sport))}
      },
      {
        title: 'Username',
        dataIndex: 'username',
        className: 'col-center'
      },
      {
        title: 'Bet Type',
        dataIndex: 'type',
        className: 'col-center',
        render: (type, bet) => {
          if (type == 'Parlay') {
            return 'Parlay'
          } else {
            return bet.bet_type
          }
        }
      },
      {
        title: 'Bet',
        dataIndex: 'team',
        className: 'col-center',
        render: (team, bet) => {
          if (bet.type == 'Parlay') {
            return 'Parlay'
          } else {
            if (bet.u_id == userState.user_id) {
              return team
            } else {
              if (bet.bet_type == 'O/U') {
                return team == 'Over'? 'Under' : 'Over'
              } else {
                return team == bet.team1? bet.team2 : bet.team1
              }
            }
          }
        }
      },
      {
        title: 'Odds',
        key: 'odds',
        dataIndex: 'odds',
        className: 'col-center',
        sorter: (a, b) => parseFloat(a.odds) - parseFloat(b.odds),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortedInfo.columnKey === 'odds' && sortedInfo.order,
        render: (odds, bet) => {
          if (bet.u_id == userState.user_id) {
            return odds
          } else {
            return formatOdds(-parseInt(odds))
          }
        }
      },
      {
        title: 'Entry Fee',
        key: 'fee',
        dataIndex: 'fee',
        sorter: (a, b) => parseFloat(a.fee) - parseFloat(b.fee),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortedInfo.columnKey === 'fee' && sortedInfo.order,
        render: (fee, bet) => {
          if (bet.u_id == userState.user_id) {
            return (renderCurrency(bet.currency, bet.bet))
          } else {
            return (renderCurrency(bet.currency, fee))
          }
        }
      },
      {
        title: 'Winnings',
        key: 'win',
        dataIndex: 'win',
        sorter: (a, b) => parseFloat(a.win) - parseFloat(b.win),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortedInfo.columnKey === 'win' && sortedInfo.order,
        render: (win, bet) => {
          return (renderCurrency(bet.currency, win))
        }
      },
      {
        title: 'Live',
        key: 'live',
        dataIndex: 'utc',
        className: 'col-center',
        sorter: (a, b) => a.utc - b.utc,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortedInfo.columnKey === 'live' && sortedInfo.order,
        render: (utc, bet) => {
          return (getDateTime(utc))
        }
      },
    ]
    if (isMobile) {
      columns = [
        {
          title: 'Sport',
          dataIndex: 'sport',
          className: 'col-left',
          render: (sport, bet) => {
            return (sportImgs(sport))
          }
        },
        {
          title: 'Bet',
          dataIndex: 'team',
          className: 'col-center',
          render: (team, bet) => {
            if (bet.type == 'Parlay') {
              return 'Parlay'
            } else {
              if (bet.u_id == userState.user_id) {
                return team
              } else {
                if (bet.bet_type == 'O/U') {
                  return team == 'Over'? 'Under' : 'Over'
                } else {
                  return team == bet.team1? bet.team2 : bet.team1
                }
              }
            }
          }
        },
        {
          title: 'Winnings',
          key: 'win',
          dataIndex: 'win',
          sorter: (a, b) => parseFloat(a.win) - parseFloat(b.win),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortedInfo.columnKey === 'win' && sortedInfo.order,
          render: (win, bet) => {
            return (renderCurrency(bet.currency, win))
          }
        },
        {
          title: 'Live',
          key: 'live',
          dataIndex: 'utc',
          className: 'col-center',
          sorter: (a, b) => a.utc - b.utc,
          sortDirections: ['ascend', 'descend'],
          sortOrder: sortedInfo.columnKey === 'live' && sortedInfo.order,
          render: (utc, bet) => {
            return (getDateTime(utc))
          }
        },
      ]
    }

    return (
      <div className="open">

        <div className="row">
          <div className={ isMobile ? "col-md-12 col-lg-12 no-padding" : "col-md-12 col-lg-12" }>
            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/open.png" alt=""/>
                  <h4 className="d-inline-block"> Sparlay Open Bets (Public Bets)</h4>
                  { isMobile ? (
                    <a className="pull-right filter" onClick={this.showDrawer}>Filter</a>
                  ) : null}
                </div>
              </div>

              <div className={ isMobile ? "card-body mobile-body" : "card-body desktop-body" }>
                <div className="row">

                  { !isMobile ? (
                    <div className="open__search">
                      <Search
                        className="open__search__input"
                        placeholder="Search Username"
                        value={this.state.searchWord}
                        onChange={this.onSearchChange}
                        onSearch={this.onSearch}
                        allowClear={true}
                        spellCheck={false}
                      />

                      <label className="open__search__title">Category</label>
                      <RadioGroup defaultValue="open" value={this.state.searchCat} size="large" className="open__search__sel" onChange={this.onRadioCat}>
                        <RadioButton value="open" className="open__search__sel__bet">Open Bets</RadioButton>
                        <RadioButton value="my_open" className="open__search__sel__bet">My Open Bets</RadioButton>
                        <RadioButton value="accepted" className="open__search__sel__bet">My Accepted Bets</RadioButton>
                      </RadioGroup>

                      <label className="open__search__title">Type</label>
                      <RadioGroup defaultValue="all" value={this.state.searchType} size="large" className="open__search__sel">
                        <RadioButton value="Straight" className="open__search__sel__type" onClick={this.onType.bind(this, 'Straight')}>Straight</RadioButton>
                        <RadioButton value="Parlay" className="open__search__sel__type" onClick={this.onType.bind(this, 'Parlay')}>Parlay</RadioButton>
                      </RadioGroup>

                      <label className="open__search__title">Odds</label>
                      <RadioGroup defaultValue="all" value={this.state.searchBet} size="large" className="open__search__sel">
                        <RadioButton value="Spread" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'Spread')}>Spread</RadioButton>
                        <RadioButton value="Line" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'Line')}>Game Line</RadioButton>
                        <RadioButton value="O/U" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'O/U')}>Over/Under</RadioButton>
                      </RadioGroup>

                      <label className="open__search__title">Currency</label>
                      <RadioGroup defaultValue="all" value={this.state.searchCurrency} size="large" className="open__search__sel">
                        <RadioButton value="0" className="open__search__sel__bet" onClick={this.onCurrency.bind(this, '0')}>Sparlay Tokens {sparlayToken()}</RadioButton>
                        <RadioButton value="1" className="open__search__sel__bet" onClick={this.onCurrency.bind(this, '1')}>Sparlay Funds {sparlayFund()} </RadioButton>
                      </RadioGroup>

                      <label className="open__search__title">Entry Fee</label>
                      <Row>
                        <Col span={11}>
                          <Input
                            value={this.state.searchFeeMin}
                            placeholder="Min"
                            spellCheck="false"
                            onChange={this.onInputRange.bind(this, 'fee_min')}
                          />
                        </Col>
                        <Col span={2}><h5 style={{textAlign: 'center', marginTop: '5px'}}>~</h5></Col>
                        <Col span={11}>
                          <Input
                            value={this.state.searchFeeMax}
                            placeholder="Max"
                            spellCheck="false"
                            onChange={this.onInputRange.bind(this, 'fee_max')}
                          />
                        </Col>
                      </Row>
                      <div className="row buttons">
                        <Button className="btn-apply" onClick={this.search}>Apply</Button>
                      </div>

                      <label className="open__search__title">Potential Winnings</label>
                      <Row>
                        <Col span={11}>
                          <Input
                            value={this.state.searchWinMin}
                            placeholder="Min"
                            spellCheck="false"
                            onChange={this.onInputRange.bind(this, 'win_min')}
                          />
                        </Col>
                        <Col span={2}><h5 style={{textAlign: 'center', marginTop: '5px'}}>~</h5></Col>
                        <Col span={11}>
                          <Input
                            value={this.state.searchWinMax}
                            placeholder="Max"
                            spellCheck="false"
                            onChange={this.onInputRange.bind(this, 'win_max')}
                          />
                        </Col>
                      </Row>
                      <div className="row buttons">
                        <Button className="btn-apply" onClick={this.search}>Apply</Button>
                      </div>

                      <div className="open__search__clear">
                        <a onClick={this.onResetFilters}>Reset Filters</a>
                      </div>
                    </div>
                  ) : null }

                  <div className={ isMobile ? "col-12" : "open__bets" }>
                    <Table className="ant-table-dark open__table" 
                      columns={columns}
                      dataSource={this.state.bets}
                      onChange={this.sortTable}
                      rowKey={(record, rowIndex) => { return record.id }}
                      onRow={(record, rowIndex) => {
                        return {
                          onClick: (e) => { this.overview(record) }
                        }
                      }}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        { isMobile ? (
          <Drawer
            className="filter-body"
            title="Filter Bets"
            placement="right"
            closable={true}
            onClose={this.closeDrawer}
            visible={this.state.filterDrawer}
            zIndex={9999999}
          >
            <Search
              className="open__search__input"
              placeholder="Search Username"
              value={this.state.searchWord}
              onChange={this.onSearchChange}
              onSearch={this.onSearch}
              allowClear={true}
              spellCheck={false}
            />

            <label className="open__search__title">Category</label>
            <RadioGroup defaultValue="open" value={this.state.searchCat} size="large" className="open__search__sel" onChange={this.onRadioCat}>
              <RadioButton value="open" className="open__search__sel__bet">Open Bets</RadioButton>
              <RadioButton value="my_open" className="open__search__sel__bet">My Open Bets</RadioButton>
              <RadioButton value="accepted" className="open__search__sel__bet">My Accepted Bets</RadioButton>
            </RadioGroup>

            <label className="open__search__title">Type</label>
            <RadioGroup defaultValue="all" value={this.state.searchType} size="large" className="open__search__sel">
              <RadioButton value="Straight" className="open__search__sel__type" onClick={this.onType.bind(this, 'Straight')}>Straight</RadioButton>
              <RadioButton value="Parlay" className="open__search__sel__type" onClick={this.onType.bind(this, 'Parlay')}>Parlay</RadioButton>
            </RadioGroup>

            <label className="open__search__title">Odds</label>
            <RadioGroup defaultValue="all" value={this.state.searchBet} size="large" className="open__search__sel">
              <RadioButton value="Spread" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'Spread')}>Spread</RadioButton>
              <RadioButton value="Line" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'Line')}>Game Line</RadioButton>
              <RadioButton value="O/U" className="open__search__sel__bet" onClick={this.onBet.bind(this, 'O/U')}>Over/Under</RadioButton>
            </RadioGroup>

            <label className="open__search__title">Currency</label>
            <RadioGroup defaultValue="all" value={this.state.searchCurrency} size="large" className="open__search__sel">
              <RadioButton value="0" className="open__search__sel__bet" onClick={this.onCurrency.bind(this, '0')}>Sparlay Tokens {sparlayToken()}</RadioButton>
              <RadioButton value="1" className="open__search__sel__bet" onClick={this.onCurrency.bind(this, '1')}>Sparlay Funds {sparlayFund()} </RadioButton>
            </RadioGroup>

            <label className="open__search__title">Entry Fee</label>
            <Row>
              <Col span={11}>
                <Input
                  value={this.state.searchFeeMin}
                  placeholder="Min"
                  spellCheck="false"
                  onChange={this.onInputRange.bind(this, 'fee_min')}
                />
              </Col>
              <Col span={2}><h5 style={{textAlign: 'center', marginTop: '5px'}}>~</h5></Col>
              <Col span={11}>
                <Input
                  value={this.state.searchFeeMax}
                  placeholder="Max"
                  spellCheck="false"
                  onChange={this.onInputRange.bind(this, 'fee_max')}
                />
              </Col>
            </Row>
            <div className="row buttons">
              <Button className="btn-apply" onClick={this.search}>Apply</Button>
            </div>

            <label className="open__search__title">Potential Winnings</label>
            <Row>
              <Col span={11}>
                <Input
                  value={this.state.searchWinMin}
                  placeholder="Min"
                  spellCheck="false"
                  onChange={this.onInputRange.bind(this, 'win_min')}
                />
              </Col>
              <Col span={2}><h5 style={{textAlign: 'center', marginTop: '5px'}}>~</h5></Col>
              <Col span={11}>
                <Input
                  value={this.state.searchWinMax}
                  placeholder="Max"
                  spellCheck="false"
                  onChange={this.onInputRange.bind(this, 'win_max')}
                />
              </Col>
            </Row>
            <div className="row buttons">
              <Button className="btn-apply" onClick={this.search}>Apply</Button>
            </div>

            <div className="open__search__clear">
              <a onClick={this.onResetFilters}>Reset Filters</a>
            </div>
          </Drawer>
        ) : null}


        <Modal
          className={this.state.searchCat == 'accepted' ? "overview-straight no_footer" : "overview-straight"}
          visible={this.state.straight}
          title={renderOverviewTitle(bet.accept, this.state.searchCat)}
          onCancel={this.straightHide}
          footer={[
            <Button key="1" className="decline pull-left" onClick={this.straightCancel}>
              {this.state.searchCat == 'open' || this.state.searchCat == 'wager' ? "Decline Bet" : "Cancel Bet"}
            </Button>,
            <Button key="2" className="accept" onClick={this.straightOK}>
              {this.state.searchCat == 'open' || this.state.searchCat == 'wager' ? "Accept Bet" : "Keep Bet"}
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

          {bet.result !== "" && bet.result != undefined && this.state.searchCat == 'accepted' ? (
            <div className="field" style={{border: '0px', textAlign: 'center'}}>
              {renderBetResult(bet.result)}
            </div>
          ): null }
        </Modal>


        <Modal
          className={this.state.searchCat == 'accepted' ? "overview-parlay no_footer" : "overview-parlay"}
          visible={this.state.parlay}
          title={renderOverviewTitle(bet.accept, this.state.searchCat)}
          onCancel={this.parlayHide}
          footer={[
            <Button key="1" className="decline pull-left" onClick={this.parlayCancel}>
              {this.state.searchCat == 'open' || this.state.searchCat == 'wager' ? "Decline Bet" : "Cancel Bet"}
            </Button>,
            <Button key="2" className="accept" onClick={this.parlayOK}>
              {this.state.searchCat == 'open' || this.state.searchCat == 'wager' ? "Accept Bet" : "Keep Bet"}
            </Button>,
          ]}
        >
          <Tabs className={ isMobile ? "tab-m" : "tab" } onChange={(key) => {}}>
            <TabPane tab="My Bet" key="1">
              <div className="field">
                <label className="field__title">Bet Type</label>
                <label className="field__value pull-right">{bet.type}</label>
              </div>
              <div className="field" style={{padding: '12px 16px 12px'}}>
                {this.state.parlay_bets.map((b, index) =>
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">
                        {b.league}
                      </label>
                      <label className="field2__title pull-right">{getDateTime(b.utc)}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__title">{b.team1} </label>
                      <label className="field2__title">&nbsp; -vs- &nbsp;</label>
                      <label className="field2__title"> {b.team2}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__value">{b.team}</label>
                      <label className="field2__title">&nbsp;({b.type})</label>
                      <label className="field2__value pull-right">{oddsData(b.type, b.point, b.odds)}</label>
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
              <div className="field" style={{padding: '12px 16px 12px'}}>
                {this.state.oparlay_bets.map((b, index) =>
                  <div key={index} className="field3">
                    <div className="field2">
                      <label className="field2__title">
                        {b.league}
                      </label>
                      <label className="field2__title pull-right">{getDateTime(b.utc)}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__title">{b.team1} </label>
                      <label className="field2__title">&nbsp; -vs- &nbsp;</label>
                      <label className="field2__title"> {b.team2}</label>
                    </div>
                    <div className="field2">
                      <label className="field2__value">{b.team}</label>
                      <label className="field2__title">&nbsp;({b.type})</label>
                      <label className="field2__value pull-right">{oddsData(b.type, b.point, b.odds)}</label>
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

          {bet.result !== "" && bet.result != undefined && this.state.searchCat == 'accepted' ? (
            <div className="field" style={{border: '0px', textAlign: 'center'}}>
              {renderBetResult(bet.result)}
            </div>
          ): null }
        </Modal>


        <Modal
          className="cancel_confirm"
          visible={this.state.cancelConfirm}
          title="Confirm for Cancel Bet!"
          onCancel={this.cancelNo}
          footer={[
            <Button key="1" className="ok" onClick={this.cancelNo}>
              NO
            </Button>,
            <Button key="2" className="cancel" onClick={this.cancelYes}>
              YES
            </Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">Are you sure you want to cancel this bet?</label>
          </div>
        </Modal>


        <Modal
          className="prompt-odds"
          visible={this.state.oddsWarning}
          title="Bet Confirmation"
          onOk={this.warningOk}
          onCancel={this.warningCancel}
          footer={[
            <Button key="1" className="cancel" onClick={this.warningCancel}>Cancel</Button>,
            <Button key="2" className="ok" onClick={this.warningOk}>OK</Button>,
          ]}
        >
          <div className="field">
            <label className="field__title">You are attempting to accept a bet with extreme odds. Are you sure you want to make this wager?</label>
          </div>
        </Modal>

      </div>
    )
  }

}

export default Open
