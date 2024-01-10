import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import $ from 'jquery'
import numeral from 'numeral'
import axios from 'axios'
import qs from 'qs'
import { setUserState, setDialogState, setSiteState } from 'ducks/app'
import { sparlayToken,
  sparlayFund,
  sportImage,
  getDateTime,
  getLocalDate,
  getLocalTime,
  formatSpread,
  formatLine,
  formatTotal,
  formatOdds,
  formatPoint,
  formatNumber,
  copyLink,
  invalidLocation
} from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Select from 'antd/lib/select'
import Radio from 'antd/lib/radio'
import Spin from 'antd/lib/spin'
import Collapse from 'antd/lib/collapse'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Divider from 'antd/lib/divider'
import message from 'antd/lib/message'

import './style.scss'

const InputGroup = Input.Group
const ButtonGroup = Button.Group
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const Option = Select.Option;

const black = { color : '#111111' }
const sky = { color: '#0190fe' }
var interval, timeout, lastFetchId = 0

const mapStateToProps = ({ app }) => {
  const { siteState , sports , url , userState, dialogState } = app
  return {
    url: url,
    userState: userState,
    sports: sports,
    referral: siteState.referral,
    betSport: siteState.betSport,
    betLeague: siteState.betLeague,
    betMatch: siteState.betMatch,
    betType: siteState.betType,
    betNum: siteState.betNum,
    store: siteState.store,
    msg: dialogState.msg,
  }
}


@connect(mapStateToProps)
class CreateBet extends React.Component {

  state = {
    invalidOdds: false,

    active: ['sport'],
    sportKey: '',
    sport: 'Choose Your Sport',
    league_id: '',
    league: 'Choose League',
    match: 'Upcoming Matchups',
    type: '',

    clSport: black,
    clLeague: black,
    clMatch: black,

    leagues: [''],
    games: [],

    selected: 0,
    selectedGame: {},
    
    ownTitle: 'Create Your Own',
    odds1: '-110',
    odds2: '+110',
    spread1: '-1.5',
    spread2: '+1.5',
    score: '3',
    
    s_odds1: '-110',
    s_odds2: '+110',
    s_spread1: '-1.5',
    s_spread2: '+1.5',
    s_score: '3',

    ticketTitle: 'Straight Wagers',
    ticketType: 'Straight',
    bet: {},
    bets: [],
    parBet: '',
    parWin: '',
    activeBets: 0,
    totalBet: '0.0',
    totalWin: '0.0',

    oddsWarning: false,
    warningType: '',

    currency: '0',
    challenge: '0',
    public: '0',
    users: [],
    sUsers: [],
    searchUser: '',
    fetching: false
  }


//********************************* flow ***********************************//

  onSport = (sport) => {
    this.setState({
      sportKey: sport.key,
      sport: sport.title,
      league_id: '',
      league: 'Choose League',
      match: 'Upcoming Matchups',
      type: '',
      clSport: sky,
      clLeague: black,
      clMatch: black,
      active: ['league'],
      leagues: sport.leagues,
    })

    $('.league').slideDown(300)
    $('.match').slideUp(300)
    $('.bet').slideUp(300)
    $('.conf').slideUp(300)
  }

  onLeague = (league) => {
    this.fetchGames(league.league_id)
    this.setState({
      league_id: league.league_id,
      league: league.title,
      type: '',
      clLeague: sky,
      clMatch: black,
      active: ['match'],
      games: []
    })

    $('.match').slideDown(300)
    $('.bet').slideUp(300)
    $('.conf').slideUp(300)
  }

  onMatch = (type, match, num) => {
    const title = match.team1 + " -vs- " + match.team2 + ' @ ' + getDateTime(match.utc)
    var odds1 = '', odds2 = '', spread1 = '', spread2 = '', score = ''
    if (type === 'Line') {
      if (match.line1 === '') return
      odds1 = match.line1
      odds2 = match.line2
    } else if (type === 'Spread') {
      if (match.spread1 === '') return
      spread1 = match.point1
      spread2 = match.point2
      odds1 = match.spread1
      odds2 = match.spread2
    } else if (type === 'O/U') {
      if (match.total1 === '') return
      odds1 = match.total1
      odds2 = match.total2
      score = match.ou
    }

    this.setState({
      type: type,
      match: title,
      clMatch: sky,
      active: ['bet'],
      selectedGame: match,
      selected: num,

      team1: match.team1,
      team2: match.team2,

      odds1: odds1,
      odds2: odds2,
      spread1: spread1,
      spread2: spread2,
      score: score,

      s_odds1: odds1,
      s_odds2: odds2,
      s_spread1: spread1,
      s_spread2: spread2,
      s_score: score,

      ownTitle: 'Create Your Own',
    })

    $('.bet').slideDown(300)
    $('.conf').slideDown(300)
    $('.betting__suggested').slideDown(300)
    $('.betting__own').slideUp(300)
  }

  onConfirm = () => {
    const _state = this.state

    let odds1 = parseInt(_state.odds1)
    let odds2 = parseInt(_state.odds2)
    if ((odds1 < 100 && odds1 > -100) || (odds2 < 100 && odds2 > -100)) {
      this.setState({ invalidOdds: true })
      return
    }

    let bet = {
      league_id: _state.selectedGame.league_id,
      game_id: _state.selectedGame.game_id,
      type: _state.type,
      sport: _state.selectedGame.sport_key,
      team: '',
      bet: '',
      win: '',
      odds: '',
      point: '',
      team1: _state.team1,
      team2: _state.team2,
      odds1: _state.odds1,
      odds2: _state.odds2,
      point1: _state.spread1,
      point2: _state.spread2,
      utc: _state.selectedGame.utc
    }

    if (_state.selected === 2) {
      if (_state.type === 'O/U') {
        bet.team = 'Under'
        bet.point = parseFloat(_state.score)
        bet.point1 = _state.score
        bet.point2 = _state.score
      } else {
        bet.team = _state.selectedGame.team2
        bet.point = parseFloat(_state.spread2)
        if (bet.point > 0) {
          bet.point = '+' + bet.point
        }
      }
      bet.odds = _state.odds2
    } else {
      if (_state.type === 'O/U') {
        bet.team = 'Over'
        bet.point = parseFloat(_state.score)
        bet.point1 = _state.score
        bet.point2 = _state.score
      } else {
        bet.team = _state.selectedGame.team1
        bet.point = parseFloat(_state.spread1)
        if (bet.point > 0) {
          bet.point = '+' + bet.point
        }
      }
      bet.odds = formatOdds(_state.odds1)
    }

    if (Math.abs(parseInt(bet.odds)) > 500) {
      this.setState({
        bet: bet,
        warningType: 'confirm',
        oddsWarning: true
      })
    } else {
      this.setState({bet: bet}, this.confirm)
    }
  }

  confirm = () => {
    let bets = this.state.bets, parOdds = '', trueOdds = 1

    bets.push(this.state.bet)
    for (let bet of bets) {
      let aOdds = parseFloat(bet.odds)
      let dOdds = 0
      if (aOdds > 0)
        dOdds = (aOdds + 100) / 100
      else
        dOdds = (aOdds - 100) / aOdds

      trueOdds *= dOdds
    }

    if (trueOdds >= 2)
      parOdds = '+' + Math.round((trueOdds - 1) * 100)
    else
      parOdds = '-' + Math.round(100 / (trueOdds - 1))

    this.setState({ bets: bets, parOdds: parOdds }, this.calcParlayTotal)
  }

  warningOk = () => {
    this.setState({oddsWarning: false})

    if (this.state.warningType == 'confirm') {
      this.confirm()
    }
  }

  warningCancel = () => {
    this.setState({oddsWarning: false})
  }


//********************************* own odds *******************************//

  onOwn = () => {
    let odds1 = this.state.s_odds1
    let odds2 = this.state.s_odds2
    let spread1 = this.state.s_spread1
    let spread2 = this.state.s_spread2
    let score = this.state.s_score

    if (this.state.ownTitle === 'Create Your Own') {
      $('.betting__suggested').slideUp(300)
      $('.betting__own').slideDown(300)

      this.setState({
        ownTitle: 'Cancel Your Own',
        odds1: odds1,
        odds2: odds2,
        spread1: spread1,
        spread2: spread2,
        score: score,
      })
    } else {
      $('.betting__suggested').slideDown(300)
      $('.betting__own').slideUp(300)

      this.setState({
        ownTitle: 'Create Your Own',
        odds1: odds1,
        odds2: odds2,
        spread1: spread1,
        spread2: spread2,
        score: score,
      })
    }
  }

  onOddsDown = (num, action) => {
    const _this = this
    if (num === 1) {
      this.setOdds1(action)
      timeout = setTimeout(() => {
          interval = setInterval(_this.setOdds1, 60, action)
        }, 300)
    } else {
      this.setOdds2(action)
      timeout = setTimeout(() => {
          interval = setInterval(_this.setOdds2, 60, action)
        }, 300)
    }
  }

  onOddsUp = () => {
    clearTimeout(timeout)
    clearInterval(interval)
  }

  onOdds = (num, e) => {
    if (num === 1)
      this.setState({odds1: e.target.value})
    else
      this.setState({odds2: e.target.value})
  }

  onSpread = (num, e) => {
    if (num === 1)
      this.setState({spread1: e.target.value})
    else
      this.setState({spread2: e.target.value})
  }

  onScore = (e) => { this.setState({score: e.target.value}) }

  setOdds1 = action => {
    let newOdds = parseInt(this.state.odds1)
    if (action === 'pls')
      newOdds = newOdds + 1
    else
      newOdds = newOdds - 1

    this.setState({odds1: formatOdds(newOdds)})
  }

  setOdds2 = action => {
    let newOdds = parseInt(this.state.odds2)
    if (action === 'pls')
      newOdds = newOdds + 1
    else
      newOdds = newOdds - 1

    this.setState({odds2: formatOdds(newOdds)})
  }

  setSpread1 = action => {
    let newSpread = parseFloat(this.state.spread1)
    if (action === 'pls')
      newSpread = newSpread + 0.5
    else
      newSpread = newSpread - 0.5

    this.setState({spread1: formatPoint(newSpread)})
  }

  setSpread2 = action => {
    let newSpread = parseFloat(this.state.spread2)
    if (action === 'pls')
      newSpread = newSpread + 0.5
    else
      newSpread = newSpread - 0.5

    this.setState({spread2: formatPoint(newSpread)})
  }

  setScore = action => {
    let newScore = parseFloat(this.state.score)
    if (action === 'pls')
      newScore = newScore + 0.5
    else
      newScore = newScore - 0.5

    if (newScore < 0.5) newScore = 0.5

    this.setState({score: newScore})
  }


//********************************* Ticket *********************************//

  onRadio = (e) => {
    const bets = this.state.bets
    let tBet = 0, tWin = 0

    if (e.target.value == 'Straight') {
      for (let b of bets) {
        if(b.bet !== ''){
          tBet += parseFloat(b.bet)
          tWin += parseFloat(b.win)
        }
      }

      if (tBet == 0) {
        tBet = '0.0'
        tWin = '0.0'
      } else {
        tBet = tBet.toString()
        tWin = tWin.toString()
      }

      this.setState({
        ticketTitle: 'Straight Wagers',
        ticketType: 'Straight',
        totalBet: tBet,
        totalWin: tWin,
      })
    } else {
      if (this.state.parBet == '') {
        tBet = '0.0'
        tWin = '0.0'
      } else {
        tBet = this.state.parBet
        tWin = this.state.parWin
      }
      this.setState({
        ticketTitle: 'Parlay Wager',
        ticketType: 'Parlay',
        totalBet: tBet,
        totalWin: tWin,
      })
    }
  }

  onBetChange = (bet, index, e) => {
    bet.bet = e.target.value.replace(',', '')

    if (isNaN(parseFloat(bet.bet))) {
      bet.bet = bet.bet.slice(0, bet.bet.length - 1)
    }

    let odds = parseFloat(bet.odds), nbet = parseFloat(bet.bet), nwin = 0, profit = 0

    if (bet.bet === '') {
      bet.win = ''
    } else {
      if (odds > 0)
        nwin = parseFloat(bet.bet) * (1 + odds / 100)
      else
        nwin = parseFloat(bet.bet) * (1 - 100 / odds)

      bet.win = nwin
      bet.fee = nwin - nbet
      bet.bet = nbet
    }

    let bets = this.state.bets, tBet = 0, tWin = 0
    bets[index] = bet
    for (let i in bets) {
      if (i === index) bets[i] = bet
      if (bets[i].bet !== '') {
        tBet += parseFloat(bets[i].bet)
        tWin += parseFloat(bets[i].win)
      }
    }

    this.setState({
      bets: bets,
      totalBet: tBet,
      totalWin: tWin,
    })
  }

  onParBetChange = (e) => {
    let parBet = e.target.value.replace(',', '')
    if (isNaN(parBet)) {
      parBet = e.target.value.slice(0, e.target.value.length - 1)
    }

    this.setState({ parBet: parBet }, this.calcParlayTotal)
  }

  calcParlayTotal = () => {
    if (this.state.ticketType != 'Parlay') return

    if (this.state.parBet === '') {
      this.setState({
        parWin: '',
        totalBet: '0',
        totalWin: '0',
      })
      return
    }

    let trueOdds = 1, bets = this.state.bets
    for (let bet of bets) {
      let aOdds = parseFloat(bet.odds), dOdds = 0
      if (aOdds > 0)
        dOdds = (aOdds + 100) / 100
      else
        dOdds = (aOdds - 100) / aOdds

      trueOdds *= dOdds
    }

    let win = (parseFloat(this.state.parBet) * trueOdds)
    this.setState({
      parWin: win,
      totalBet: this.state.parBet,
      totalWin: win,
    })
  }

  clearBet = (bet, index) => {
    let bets = this.state.bets, newBets = [], tBet = 0, tWin = 0, trueOdds = 1

    for (let i=0; i<bets.length; i++) {
      if (index != i) {
        let b = bets[i]
        newBets.push(b)
        if(b.bet != ''){
          tBet += parseFloat(b.bet)
          tWin += parseFloat(b.win)
        }

        let aOdds = parseFloat(b.odds), dOdds = 0
        if (aOdds > 0)
          dOdds = (aOdds + 100) / 100
        else
          dOdds = (aOdds - 100) / aOdds

        trueOdds *= dOdds
      }
    }

    if (this.state.ticketType == 'Straight') {
      if (tBet == 0) {
        tBet = '0.0'
        tWin = '0.0'
      }

      this.setState({
        bets: newBets,
        totalBet: tBet,
        totalWin: tWin,
      })
    } else {
      let newBet = this.state.parBet.replace(',', '')
      let newWin = parseFloat(newBet) * trueOdds
      if (this.state.parBet == '') {
        newWin = ''
        tBet = '0.0'
        tWin = '0.0'
      } else {
        tBet = newBet
        tWin = newWin
      }

      if (trueOdds == 1) {
        this.setState({
          bets: newBets,
          parBet: '',
          parWin: '',
          parOdds: '',
          totalBet: '0.0',
          totalWin: '0.0',
        })
      } else {
        let parOdds = ''
        if (trueOdds >= 2)
          parOdds = '+' + Math.round((trueOdds - 1) * 100)
        else
          parOdds = '-' + Math.round(100 / (trueOdds - 1))

        this.setState({
          bets: newBets,
          parWin: newWin,
          parOdds: parOdds,
          totalBet: tBet,
          totalWin: tWin,
        })
      }
    }
  }

  onCurrency = (e) => { this.setState({currency: e.target.value}) }

  onChallenge = () => {
    let v = 1 - parseInt(this.state.challenge)
    this.setState({challenge: v.toString()})
  }

  onPublic = () => {
    let v = 1 - parseInt(this.state.public)
    this.setState({public: v.toString()})
  }

  onSearchUser = (e) => { this.setState({searchUser: e.target.value}) }

  onSelectUser = (selectedUsers) => { this.setState({sUsers: selectedUsers}) }

  clearAll = () => {
    this.setState({
      sport: 'Choose Your Sport',
      sportKey: '',
      type: 'Choose Type',
      league: 'Choose League',
      match: 'Upcoming Matchups',
      clSport: black,
      clLeague: black,
      clMatch: black,
      active: ['sport'],
      leagues: [''],
      games: [],

      selected: 0,
      selectedGame: {},

      ownTitle: 'Create Your Own',
      odds1: '-100',
      odds2: '+100',
      spread1: '-1.5',
      spread2: '+1.5',
      score: '3',

      ticketTitle: 'Straight Wagers',
      ticketType: 'Straight',
      bets: [],
      activeBets: 0,
      parBet: '',
      parWin: '',
      parOdds: '',
      totalBet: '0.0',
      totalWin: '0.0',

      sUsers: [],
      currency: '0',
      challenge: '0',
      public: '0',
    })

    $('.sport').slideDown(300)
    $('.league').slideUp(300)
    $('.match').slideUp(300)
    $('.bet').slideUp(300)
    $('.conf').slideUp(300)
  }

  placeBet = () => {
    var { dispatch , userState} = this.props
    let totalBet = parseFloat(this.state.totalBet) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))
    let totalWin = parseFloat(this.state.totalWin) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))
    let sport = ''

    if (userState.user_id === '') {
      dispatch(setDialogState({ loginPrompt: true }))
      return
    }
    if (this.state.bets.length == 0 || parseFloat(totalBet) == 0) return
    if (this.state.ticketType == 'Straight') {
      for (let bet in this.state.bets)
        if (parseFloat(bet.bet) == 0 || bet.bet === '') return
    } else {
      if (this.state.bets.length < 2) return
      for (let bet of this.state.bets) {
        if (!sport.includes(bet.sport)) {
          if (sport != '') sport += ', ' + bet.sport
          sport += bet.sport
        }
      }
    }

    if (this.state.currency != '0') {
      if (invalidLocation()) {
        dispatch(setDialogState({ locationPrompt: true }))
        return
      }
    }

    if (this.state.currency != '1' && parseFloat(userState.token) < parseFloat(totalBet)) {
      dispatch(setDialogState({ tokenPrompt: true }))
      return
    }
    if (this.state.currency != '0' && parseFloat(userState.cash) < parseFloat(totalBet)) {
      dispatch(setDialogState({ cashPrompt: true }))
      return
    }

    const _this = this
    let postData = {
      user_id: userState.user_id,
      type: this.state.ticketType,
      sport: sport,
      bets: this.state.bets,
      bet: totalBet,
      win: totalWin,
      odds: formatOdds(this.state.parOdds),
      currency: this.state.currency,
      public: this.state.public,
      challenge: this.state.challenge,
      friends: this.state.sUsers
    }
    axios({
      method: 'post',
      url: this.props.url + '/bet/place',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify(postData),
    })
      .then((res) => {
        if (res.data.res === 'success'){
          userState.token = res.data.balance.token
          userState.cash = res.data.balance.cash
          dispatch(setUserState({ userState: userState }))
          message.success('Bet successfully placed!')
          _this.clearAll()
        } else if (res.data.res === 'fail'){
          console.log(res.data.err)
        }
      })
      .catch((err) => {
        console.log('***create: place', err)
      })
  }


//*************************** Modal ****************************//

  hideInvalidOdds = () => { this.setState({ invalidOdds: false }) }


//*************************** Component ************************//

  fetchUsers = (name) => {
    const _this = this
    lastFetchId += 1
    const fetchId = lastFetchId
    this.setState({users: [], fetching: true})
    axios({
      method: 'post',
      url: this.props.url + '/bet/search/user',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: qs.stringify({name: name, user_id: this.props.userState.user_id}),
    })
    .then(function (res) {
      if (fetchId != lastFetchId) return
      if (res.data.res === 'success') {
        _this.setState({
          users: res.data.users,
          fetching: false
        })
      }
    })
    .catch(function (err) {
      console.log('*** search users:', err)
    })
  }

  fetchGames = (league_id) => {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/game/league',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify({league_id: league_id}),
    })
    .then(function (res) {
      if (res.data.res === 'success') {
        _this.setState({ games: res.data.games })
      }
    })
    .catch(function (error) {
      console.log('***create: fetchGames >', error)
    })
  }

  onCollapse = (key) => { this.setState({ active: key }) }

  shareLink = () => {
    if (this.props.userState.user_id === '') {
      this.props.dispatch(setDialogState({ referPrompt: true }))
      return
    }

    copyLink(this.props.referral)
    message.success('Copied!')
  }

  chooseSport = (sportKey) => {
    for (let sport of this.props.sports) {
      if (sport.key == sportKey) {
        this.setState({
          sportKey: sport.key,
          sport: sport.title,
          league_id: '',
          league: 'Choose League',
          match: 'Upcoming Matchups',
          type: '',
          clSport: sky,
          clLeague: black,
          clMatch: black,
          active: ['league'],
          leagues: sport.leagues,
        }, () => {
          this.props.dispatch(setSiteState({betSport: sportKey}))
        })

        return
      }
    }
  }

  chooseLeague = (league_id) => {
    for (let sport of this.props.sports) {
      for (let league of sport.leagues) {
        if (league_id == league.league_id) {
          this.fetchGames(league_id)
          this.setState({
            sportKey: sport.key,
            sport: sport.title,
            league_id: league_id,
            league: league.title,
            type: '',
            clSport: sky,
            clLeague: sky,
            clMatch: black,
            active: ['match'],
            leagues: sport.leagues,
            games: []
          })

          $('.league').slideDown(300)
          $('.match').slideDown(300)
          $('.bet').slideUp(300)
          $('.conf').slideUp(300)

          return
        }
      }
    }
  }

  chooseMatch = (match, type, num) => {
    this.onMatch(type, match, num)
    for (let sport of this.props.sports) {
      for (let league of sport.leagues) {
        if (match.league_id == league.league_id) {
          this.fetchGames(match.league_id)
          this.setState({
            sportKey: sport.key,
            sport: sport.title,
            league_id: league.league_id,
            league: league.title,
            clSport: sky,
            clLeague: sky,
            leagues: sport.leagues,
          })
          $('.league').slideDown(300)
          $('.match').slideDown(300)
          return
        }
      }
    }
  }

  componentDidMount() {
    if (this.props.store.page == '/create') {
      const stateData = this.props.store.data
      this.setState(stateData, () => {
        $('.league').show()
        $('.match').show()
        $('.bet').slideDown(300)
        $('.conf').slideDown(300)

        if (stateData.ownTitle === 'Create Your Own') {
          $('.betting__suggested').slideDown(300)
          $('.betting__own').slideUp(300)
        } else {
          $('.betting__suggested').slideUp(300)
          $('.betting__own').slideDown(300)
        }
      })
      const { dispatch } = this.props
      dispatch(setSiteState({
        store: {
          page: '',
          data: {}
        }
      }))
      return
    }

    const {betSport, betLeague, betMatch, betType, betNum} = this.props

    if (betType != '')
      this.chooseMatch(betMatch, betType, betNum)
    else if (betLeague != '')
      this.chooseLeague(betLeague)
    else if (betSport != '')
      this.chooseSport(betSport)
  }

  componentWillReceiveProps(newProps) {
    const { betLeague, msg } = newProps

    if (msg != '') {
      const { dispatch } = this.props

      dispatch(setDialogState({ msg: '' }))
      dispatch(setSiteState({
        store: {
          page: '/create',
          data: this.state
        }
      }))
      window.localStorage.setItem('sparlay.userStore', JSON.stringify({
        page: '/create',
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
      return
    }

    if (betLeague != this.state.league_id){
      this.chooseLeague(betLeague)
      return
    }
  }


//**************************** Render **************************//

  render() {
    const { isMobile } = this.props

    return (
      <div className="m-create">

        <div className="row">
          { isMobile ? (
            <div className="col-md-12 col-lg-4 no-padding">

              <div className="refer card refer-m">
                <div className="card-body">
                  <h1>GET AN EXTRA 2,000 TOKENS</h1>
                  <h1>FOR REFERRALS THIS WEEK</h1>
                  <h4>Share our referral link with your friends!</h4>
                  <InputGroup compact className="link-group col-12">
                    <Input size="large" className="sharelink" disabled={true} value={this.props.referral} />
                    <Button className="m-button" style={{height: '40px', width: '100px'}} onClick={this.shareLink}>
                      Copy Link
                    </Button>
                  </InputGroup>
                  <h5>Receive 100 Sparlay Tokens for each referral!</h5>
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
                </div>
              </div>

              <div className="ticket card">
                <div className="card-header">
                  <div className="ticket__title utils__title">
                    <h4> &nbsp; Bet Ticket</h4>
                  </div>
                </div>

                <div className="card-body">
                  <RadioGroup className="ticket__select" defaultValue="Straight" value={this.state.ticketType} onChange={this.onRadio}>
                    <RadioButton className="ticket__select__item" value="Straight">Straight</RadioButton>
                    <RadioButton className="ticket__select__item" value="Parlay">Parlay</RadioButton>
                  </RadioGroup>
                  <label className="ticket__type">{this.state.ticketTitle}</label>

                  <div className="ticket__bets">
                    {this.state.bets.map((bet, index) =>
                      <div key={index} className="ticket__bets__area">
                        <div>
                          <label>{bet.team1} -vs- {bet.team2} ({bet.type})</label>
                          <Button className="ticket__bets__close pull-right" icon="close"
                                  onClick={this.clearBet.bind(this, bet, index)}/>
                        </div>
                        <div>
                          <label>{bet.team}</label>
                          {bet.type == 'Line' ? (
                            <label className='d-inline-block' style={{marginLeft: '20px'}}>
                              {bet.odds}
                            </label>
                          ) : (
                            <label className='d-inline-block' style={{marginLeft: '20px'}}>
                              {bet.point}({bet.odds})
                            </label>
                          )}
                        </div>
                        {this.state.ticketType === "Straight" ? (
                          <div>
                            <label style={{paddingTop: '5px'}}>Bet &nbsp;&nbsp;</label>
                            <Input className="d-inline-block ticket__bets__value" value={formatNumber(bet.bet, 'input')}
                                   placeholder='0.0' onChange={this.onBetChange.bind(this, bet, index)}/>
                            <label className="d-inline-block">Win &nbsp;&nbsp;</label>
                            <Input className="d-inline-block ticket__bets__value" value={formatNumber(bet.win, 'input')}
                                   placeholder='0.0' disabled={true}/>
                          </div>
                        ): null}
                      </div>
                    )}

                    {this.state.ticketType === "Parlay" ? (
                      <div>
                        {this.state.bets.length > 0 ? (
                          <div style={{marginTop: '20px'}}>
                            <div><label>Odds &nbsp;{this.state.parOdds}</label></div>
                            <div style={{marginTop: '5px'}}>
                              <label>Bet &nbsp;&nbsp;</label>
                              <Input className="d-inline-block ticket__bets__value" value={formatNumber(this.state.parBet, 'input')}
                                     placeholder='0.0' onChange={this.onParBetChange}/>
                              <label className="d-inline-block">Win &nbsp;&nbsp;</label>
                              <Input className="d-inline-block ticket__bets__value" value={formatNumber(this.state.parWin, 'input')}
                                     placeholder='0.0' disabled={true}/>
                            </div>
                          </div>
                        ): null}
                      </div>
                    ): null}
                  </div>

                  <div className="ticket__summary">

                    <Row>
                      <Col span={8}>
                        <label className="title">Bet Currency</label>
                      </Col>
                      <Col span={16}>
                        <Radio.Group defaultValue="0" value={this.state.currency} onChange={this.onCurrency}>
                          <Radio.Button value="0" style={{width: '60px', textAlign: 'center'}}>{sparlayToken()}</Radio.Button>
                          <Radio.Button value="1" style={{width: '60px', textAlign: 'center'}}>{sparlayFund()}</Radio.Button>
                          <Radio.Button value="2" >Both</Radio.Button>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col span={12} style={{textAlign: 'center'}}>
                        <Radio.Group defaultValue="0" size="large" value={this.state.challenge}>
                          <Radio.Button value="1" onClick={this.onChallenge} style={{width: '190px'}}>Challenge Your Friends</Radio.Button>
                        </Radio.Group>
                      </Col>
                      <Col span={12} style={{textAlign: 'center'}}>
                        <Radio.Group defaultValue="0" size="large" value={this.state.public}>
                          <Radio.Button value="1" onClick={this.onPublic} style={{width: '190px'}}>Bet Publicly</Radio.Button>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <br/>

                    <label className="title">Friends Challenged ({this.state.sUsers.length * this.state.challenge})</label>
                    <div style={{textAlign: 'center'}}>
                      <Select
                        className="select-search"
                        mode="multiple"
                        labelInValue
                        placeholder="Search Friends"
                        value={this.state.sUsers}
                        filterOption={false}
                        notFoundContent={this.state.fetching ? <Spin size="small" /> : null}
                        onChange={this.onSelectUser}
                        onSearch={this.fetchUsers}
                        spellCheck={false}
                        disabled={this.state.challenge != '1'}
                      >
                        {this.state.users.map(u => (
                          <Option key={u.id}>{u.username}</Option>
                        ))}
                      </Select>
                    </div>

                    <Divider/>

                    <div>
                      <label className="ticket__summary__title">Summary</label>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Active Bets</label>
                        <label className="d-inline-block pull-right ticket__summary__sum">
                          {this.state.bets.length * (this.state.sUsers.length * this.state.challenge + parseInt(this.state.public))}
                        </label>
                      </div>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Amount Wagered</label>
                        {this.state.currency != '1' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayToken()} {numeral(parseFloat(this.state.totalBet) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))).format('0,0[.]00')}
                          </label>
                        ) : null}
                        {this.state.currency != '0' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayFund()} {numeral(parseFloat(this.state.totalBet) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))).format('0,0[.]00')}
                          </label>
                        ) : null}
                      </div>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Potential Winnings</label>
                        {this.state.currency != '1' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayToken()} {formatNumber(parseFloat(this.state.totalWin) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public)))}
                          </label>
                        ) : null}
                        {this.state.currency != '0' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayFund()} {formatNumber(parseFloat(this.state.totalWin) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public)))}
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="ticket__buttons">
                    <div className="row">
                      <Button className="col-4 m-button" onClick={this.clearAll}>Clear All Bets</Button>
                      <div className="col-4"></div>
                      <Button className="col-4 y-button" onClick={this.placeBet}>Place Bet</Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : null}

          <div className={ isMobile ? "col-md-12 col-lg-8 no-padding" : "col-md-12 col-lg-8"}>
            <div className="options card">
              <div className="card-header">
                <div className="options__title utils__title">
                  <label style={{fontSize: '20px', color: '#eec201', fontWeight: '600', fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif'}}>$</label>
                  <h4 className="d-inline-block">Create Your Bet</h4>
                </div>
              </div>

              <div className="card-body">

                <Collapse className={ isMobile ? "choose-m choose" : "choose" }
                  activeKey={this.state.active} onChange={this.onCollapse}
                >

                  <Panel className="sport" key="sport" showArrow={false} forceRender={true}
                    header={
                      <label style={this.state.clSport}>
                        {this.state.sportKey != '' ? (
                        <img className="sparlay-sport" alt=""
                          style={{marginBottom: '3px', marginLeft: '0px'}}
                          src={sportImage(this.state.sportKey, 'blue')} />) : null }
                        {this.state.sport}
                      </label>
                    }
                  >
                    <div className="row choose-sport1" style={{margin: '0'}} >
                      {this.props.sports.map((sport, index) =>
                        <div key={index} className="col-lg-4 btn-sport">
                          <Button className="m-button col-12 sport_button" onClick={this.onSport.bind(this, sport)}>
                            <img
                              className="sparlay-sport" alt=""
                              style={{marginBottom: '3px', marginLeft: '0px'}}
                              src={sportImage(sport.key, 'white')} />
                            {sport.title}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Panel>

                  <Panel className="league" key="league" showArrow={false} style={{display: 'none'}}
                    header={
                      <label style={this.state.clLeague}>
                        <img
                          className="sparlay-sport" alt=""
                          style={{marginBottom: '3px', marginLeft: '0px'}}
                          src={sportImage(this.state.sportKey, 'blue')} />
                        {this.state.league}
                      </label>
                    }
                  >
                    <div className="row" style={{margin: '0'}} >
                      {this.state.leagues.map((league, index) =>
                        <div key={index} className="col-lg-4 btn-sport">
                          <Button className="m-button col-12 league_button" onClick={this.onLeague.bind(this, league)}>{league.title}</Button>
                        </div>
                      )}
                    </div>
                  </Panel>

                  <Panel className="match" key="match" showArrow={false} style={{display: 'none'}} forceRender={true}
                    header={
                      <label style={this.state.clMatch}>
                        <img
                          className="sparlay-sport" alt=""
                          style={{marginBottom: '3px', marginLeft: '0px'}}
                          src={sportImage(this.state.sportKey, 'blue')} />
                        {this.state.match}
                      </label>
                    }
                  >
                    <div className={ isMobile ? "upcoming upcoming-m" : "upcoming" }>
                      <div className="col-12 upcoming-header-area">
                        <label  className="col-2 upcoming-header" style={{'paddingLeft' : '0'}}>
                          Time
                        </label>
                        <div
                          className="col-10 d-inline-block"
                          style={{'padding' : '0px 20px 0px 10px'}}
                        >
                          <label className={ isMobile ? "col-3 upcoming-header" : "col-6 upcoming-header" }
                            style={{'textAlign' : 'left', 'paddingLeft' : '0'}}
                          >
                            Team
                          </label>
                          <label className={ isMobile ? "col-3 upcoming-header-m" : "col-2 upcoming-header" }>Spread</label>
                          <label className={ isMobile ? "col-3 upcoming-header-m" : "col-2 upcoming-header" }>Money</label>
                          <label className={ isMobile ? "col-3 upcoming-header-m" : "col-2 upcoming-header" }>Total</label>
                        </div>
                      </div>

                      {this.state.games.map((game, index) =>
                        <div key={index} className="col-12 no-padding upcoming-value-area">
                          <div className="row no-padding no-margin">
                            <div className="col-2 upcoming-time no-padding">
                              <label className="upcoming-time-val">{getLocalDate(game.utc)}</label>
                              <label className="upcoming-time-val" style={{'paddingTop' : '5px'}}>{getLocalTime(game.utc)}</label>
                            </div>
                            <div className="col-10 d-inline-block no-padding">
                              <div className={ isMobile ? "row no-margin upcoming-info-m" : "row no-margin upcoming-info" }>
                                <div className={ isMobile ? "col-3 upcoming-team no-padding" : "col-6 upcoming-team no-padding" }>
                                  <a><label className="upcoming-team-sport">
                                    <img
                                      className="sport-small" alt=""
                                      src={sportImage(this.state.sportKey, 'blue')} />
                                    {game.league_title}
                                  </label></a>
                                  <label className="upcoming-team-name1">{game.team1}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer"
                                    onClick={this.onMatch.bind(this, 'Spread', game, 1)}
                                  >{formatSpread(game.point1, game.spread1)}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer"
                                    onClick={this.onMatch.bind(this, 'Line', game, 1)}
                                  >{game.line1}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer"
                                    onClick={this.onMatch.bind(this, 'O/U', game, 1)}
                                  >{formatTotal('O', game.ou, game.total1)}</label>
                                </div>
                              </div>
                              <div className={ isMobile ? "row no-margin upcoming-info-m" : "row no-margin upcoming-info" }>
                                <div className={ isMobile ? "col-3 upcoming-team-m no-padding" : "col-6 upcoming-team no-padding" }>
                                  <label className={ isMobile ? "upcoming-team-name2-m" : "upcoming-team-name2" }>{game.team2}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer" style={{marginTop: '0'}}
                                    onClick={this.onMatch.bind(this, 'Spread', game, 2)}
                                  >{formatSpread(game.point2, game.spread2)}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer" style={{marginTop: '0'}}
                                    onClick={this.onMatch.bind(this, 'Line', game, 2)}
                                  >{game.line2}</label>
                                </div>
                                <div className={ isMobile ? "col-3 upcoming-rect-m" : "col-2 upcoming-rect" }>
                                  <label className="options-pointer" style={{marginTop: '0'}}
                                    onClick={this.onMatch.bind(this, 'O/U', game, 2)}
                                  >{formatTotal('U', game.ou, game.total2)}</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Panel>

                  <Panel className="bet" key="bet" showArrow={false} style={{display: 'none'}} forceRender={true}
                    header="Betting Odds"
                  >
                    <div className="betting">
                      <div className="betting__suggested">
                        <label>Suggested Vegas Lines ( {this.state.type} )</label>
                        <div className="row betting__teams">
                          <div
                            className={
                              this.state.selected === 1 ? "col-lg-5 betting__line betting__selected" : "col-lg-5 betting__line"
                            }
                          >
                            {this.state.type === 'O/U' ? (
                              <label className="betting__line__team">Over</label>
                            ) : (
                              <label className="betting__line__team">{this.state.selectedGame.team1}</label>
                            )}

                            <label className="d-inline-block pull-right betting__line__value">{this.state.odds1}</label>

                            {this.state.type === 'Spread' ? (
                              <label className="d-inline-block pull-right betting__line__odds">{this.state.spread1}</label>
                            ) : null}

                            {this.state.type === 'O/U' ? (
                              <label className="d-inline-block pull-right betting__line__odds">{this.state.score}</label>
                            ) : null}
                          </div>

                          <div className="col-lg-2"></div>

                          <div
                          className={
                            this.state.selected === 2 ? "col-lg-5 betting__line betting__selected" : "col-lg-5 betting__line"
                          }
                          >
                            {this.state.type === 'O/U' ? (
                              <label className="betting__line__team">Under</label>
                            ) : (
                              <label className="betting__line__team">{this.state.selectedGame.team2}</label>
                            )}

                            <label className="d-inline-block pull-right betting__line__value">{this.state.odds2}</label>

                            {this.state.type === 'Spread' ? (
                              <label className="d-inline-block pull-right betting__line__odds">{this.state.spread2}</label>
                            ) : null}
                            {this.state.type === 'O/U' ? (
                              <label className="d-inline-block pull-right betting__line__odds">{this.state.score}</label>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="betting__own" style={{ display: 'none'}}>
                        <label>Create Your Own Betting Odds ( {this.state.type} )</label>

                        {this.state.type === 'Line' ? (
                        <div className="row betting__odds ">
                          {this.state.selected === 1 ? (
                            <div className="col-lg-5 betting__line betting__selected">
                              <label className="betting__line__team">{this.state.selectedGame.team1}</label>
                              <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds1}
                              onChange={this.onOdds.bind(this, 1)}/>
                              <ButtonGroup className="d-inline-block pull-right">
                                <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 1, 'pls')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >+</Button>
                                <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 1, 'mns')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >-</Button>
                              </ButtonGroup>
                            </div>
                          ) : (
                            <div className="col-lg-5 betting__line">
                              <label className="betting__line__team">{this.state.selectedGame.team1}</label>
                              <label className="d-inline-block pull-right betting__line__value">{this.state.odds1}</label>
                            </div>
                          )}
                          <div className="col-lg-2"></div>
                          {this.state.selected === 2 ? (
                            <div className="col-lg-5 betting__line betting__selected">
                              <label className="betting__line__team">{this.state.selectedGame.team2}</label>
                              <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds2}
                                onChange={this.onOdds.bind(this, 2)}/>
                              <ButtonGroup className="d-inline-block pull-right">
                                <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 2, 'pls')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >+</Button>
                                <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 2, 'mns')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >-</Button>
                              </ButtonGroup>
                            </div>
                          ) : (
                            <div className="col-lg-5 betting__line">
                              <label className="betting__line__team">{this.state.selectedGame.team2}</label>
                              <label className="d-inline-block pull-right betting__line__value">{this.state.odds2}</label>
                            </div>
                          )}
                        </div>
                        ) : null}

                        {this.state.type === 'Spread' ? (
                          <div className="row betting__odds">
                            {this.state.selected === 1 ? (
                              <div className="col-lg-5 betting__line betting__selected">
                                <label className="betting__line__team">{this.state.selectedGame.team1}</label>
                                <div className="section">
                                  <label className="field">Spread</label>
                                  <Input className="d-inline-block pull-right betting__line__value" value={this.state.spread1}
                                  onChange={this.onSpread.bind(this, 1)}/>
                                  <ButtonGroup className="d-inline-block pull-right">
                                    <Button className="btn-pm" onMouseDown={this.setSpread1.bind(this, 'pls')}>+</Button>
                                    <Button className="btn-pm" onMouseDown={this.setSpread1.bind(this, 'min')}>-</Button>
                                  </ButtonGroup>
                                </div>
                                <div className="section">
                                  <label className="field">Odds</label>
                                  <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds1}
                                  onChange={this.onOdds.bind(this, 1)}/>
                                  <ButtonGroup className="d-inline-block pull-right">
                                    <Button className="btn-pm"
                                    onMouseDown={this.onOddsDown.bind(this, 1, 'pls')}
                                    onMouseUp={this.onOddsUp}
                                    onMouseOut={this.onOddsUp} >+</Button>
                                    <Button className="btn-pm"
                                    onMouseDown={this.onOddsDown.bind(this, 1, 'mns')}
                                    onMouseUp={this.onOddsUp}
                                    onMouseOut={this.onOddsUp} >-</Button>
                                  </ButtonGroup>
                                </div>
                              </div>
                            ):(
                              <div className="col-lg-5 betting__line">
                                <label className="betting__line__team">{this.state.selectedGame.team1}</label>
                                <div className="section">
                                  <label className="field">Spread</label>
                                  <label className="d-inline-block pull-right betting__line__value">{this.state.spread1}</label>
                                </div>
                                <div className="section">
                                  <label className="field">Odds</label>
                                  <label className="d-inline-block pull-right betting__line__value">{this.state.odds1}</label>
                                </div>
                              </div>
                            )}
                            <div className="col-lg-2"></div>
                            {this.state.selected === 2 ? (
                              <div className="col-lg-5 betting__line betting__selected">
                                <label className="betting__line__team">{this.state.selectedGame.team2}</label>
                                <div className="section">
                                  <label className="field">Spread</label>
                                  <Input className="d-inline-block pull-right betting__line__value" value={this.state.spread2}
                                  onChange={this.onSpread.bind(this, 2)}/>
                                  <ButtonGroup className="d-inline-block pull-right">
                                    <Button className="btn-pm" onMouseDown={this.setSpread2.bind(this, 'pls')}>+</Button>
                                    <Button className="btn-pm" onMouseDown={this.setSpread2.bind(this, 'min')}>-</Button>
                                  </ButtonGroup>
                                </div>
                                <div className="section">
                                  <label className="field">Odds</label>
                                  <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds2}
                                  onChange={this.onOdds.bind(this, 2)}/>
                                  <ButtonGroup className="d-inline-block pull-right">
                                    <Button className="btn-pm"
                                    onMouseDown={this.onOddsDown.bind(this, 2, 'pls')}
                                    onMouseUp={this.onOddsUp}
                                    onMouseOut={this.onOddsUp} >+</Button>
                                    <Button className="btn-pm"
                                    onMouseDown={this.onOddsDown.bind(this, 2, 'mns')}
                                    onMouseUp={this.onOddsUp}
                                    onMouseOut={this.onOddsUp} >-</Button>
                                  </ButtonGroup>
                                </div>
                              </div>
                            ):(
                              <div className="col-lg-5 betting__line">
                                <label className="betting__line__team">{this.state.selectedGame.team2}</label>
                                <div className="section">
                                  <label className="field">Spread</label>
                                  <label className="d-inline-block pull-right betting__line__value">{this.state.spread2}</label>
                                </div>
                                <div className="section">
                                  <label className="field">Odds</label>
                                  <label className="d-inline-block pull-right betting__line__value">{this.state.odds2}</label>
                                </div>
                              </div>
                            )}
                          </div>
                        ): null}

                        {this.state.type === 'O/U' ? (
                          <div className="row betting__odds">
                            <div className="col-lg-12 betting__choose">
                              <label>Choose Total</label>
                              <ButtonGroup>
                                <Button className="btn-pm" onMouseDown={this.setScore.bind(this, 'pls')}>+</Button>
                                <Button className="btn-pm" onMouseDown={this.setScore.bind(this, 'mns')}>-</Button>
                              </ButtonGroup>
                              <Input className="d-inline-block betting__choose__value" value={this.state.score}
                              onChange={this.onScore}/>
                            </div>
                            {this.state.selected === 1?(
                              <div className="col-lg-5 betting__line betting__selected">
                                <label className="betting__line__team">Over</label>
                                <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds1}
                                onChange={this.onOdds.bind(this, 1)}/>
                                <ButtonGroup className="d-inline-block pull-right">
                                  <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 1, 'pls')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >+</Button>
                                  <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 1, 'mns')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >-</Button>
                                </ButtonGroup>
                              </div>
                            ):(
                              <div className="col-lg-5 betting__line">
                                <label className="betting__line__team">Over</label>
                                <label className="d-inline-block pull-right betting__line__value">{this.state.odds1}</label>
                              </div>
                            )}
                            <div className="col-lg-2"></div>
                            {this.state.selected === 2?(
                              <div className="col-lg-5 betting__line betting__selected">
                                <label className="betting__line__team">Under</label>
                                <Input className="d-inline-block pull-right betting__line__value" value={this.state.odds2}
                                onChange={this.onOdds.bind(this, 2)}/>
                                <ButtonGroup className="d-inline-block pull-right">
                                  <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 2, 'pls')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >+</Button>
                                  <Button className="btn-pm"
                                  onMouseDown={this.onOddsDown.bind(this, 2, 'mns')}
                                  onMouseUp={this.onOddsUp}
                                  onMouseOut={this.onOddsUp} >-</Button>
                                </ButtonGroup>
                              </div>
                            ):(
                              <div className="col-lg-5 betting__line">
                                <label className="betting__line__team">Under</label>
                                <label className="d-inline-block pull-right betting__line__value">{this.state.odds2}</label>
                              </div>
                            )}
                          </div>
                        ): null}
                      </div>

                      <Button className="btn-create" onClick={this.onOwn}>{this.state.ownTitle}</Button>
                    </div>
                  </Panel>

                </Collapse>

                <div className="row conf" style={{margin: '20px 20px 30px', display: 'none'}}>
                  <div className="col-lg-10"></div>
                  <Button className="y-button col-lg-2" onClick={this.onConfirm}>Confirm Ticket</Button>
                </div>

              </div>
            </div>
          </div>

          { !isMobile ? (
            <div className="col-md-12 col-lg-4">
              <div className="ticket card">
                <div className="card-header">
                  <div className="ticket__title utils__title">
                    <h4> &nbsp; Bet Ticket</h4>
                  </div>
                </div>

                <div className="card-body">
                  <RadioGroup className="ticket__select" defaultValue="Straight" value={this.state.ticketType} onChange={this.onRadio}>
                    <RadioButton className="ticket__select__item" value="Straight">Straight</RadioButton>
                    <RadioButton className="ticket__select__item" value="Parlay">Parlay</RadioButton>
                  </RadioGroup>
                  <label className="ticket__type">{this.state.ticketTitle}</label>

                  <div className="ticket__bets">
                    {this.state.bets.map((bet, index) =>
                      <div key={index} className="ticket__bets__area">
                        <div>
                          <label>{bet.team1} -vs- {bet.team2} ({bet.type})</label>
                          <Button className="ticket__bets__close pull-right" icon="close"
                                  onClick={this.clearBet.bind(this, bet, index)}/>
                        </div>
                        <div>
                          <label>{bet.team}</label>
                          {bet.type == 'Line' ? (
                            <label className='d-inline-block' style={{marginLeft: '20px'}}>
                              {bet.odds}
                            </label>
                          ) : (
                            <label className='d-inline-block' style={{marginLeft: '20px'}}>
                              {bet.point}({bet.odds})
                            </label>
                          )}
                        </div>
                        {this.state.ticketType === "Straight" ? (
                          <div>
                            <label style={{paddingTop: '5px'}}>Bet &nbsp;&nbsp;</label>
                            <Input className="d-inline-block ticket__bets__value" value={formatNumber(bet.bet, 'input')}
                              placeholder='0.0' onChange={this.onBetChange.bind(this, bet, index)}/>
                            <label className="d-inline-block">Win &nbsp;&nbsp;</label>
                            <Input className="d-inline-block ticket__bets__value" value={formatNumber(bet.win, 'input')}
                              placeholder='0.0' disabled={true}/>
                          </div>
                        ): null}
                      </div>
                    )}

                    {this.state.ticketType === "Parlay" ? (
                      <div>
                        {this.state.bets.length > 0 ? (
                          <div style={{marginTop: '20px'}}>
                            <div><label>Odds &nbsp;{this.state.parOdds}</label></div>
                            <div style={{marginTop: '5px'}}>
                              <label>Bet &nbsp;&nbsp;</label>
                              <Input className="d-inline-block ticket__bets__value" value={formatNumber(this.state.parBet, 'input')}
                                placeholder='0.0' onChange={this.onParBetChange}/>
                              <label className="d-inline-block">Win &nbsp;&nbsp;</label>
                              <Input className="d-inline-block ticket__bets__value" value={formatNumber(this.state.parWin, 'input')}
                                placeholder='0.0' disabled={true}/>
                            </div>
                          </div>
                        ): null}
                      </div>
                    ): null}
                  </div>

                  <div className="ticket__summary">

                    <Row>
                      <Col span={8}>
                        <label className="title">Bet Currency</label>
                      </Col>
                      <Col span={16}>
                        <Radio.Group defaultValue="0" value={this.state.currency} onChange={this.onCurrency}>
                          <Radio.Button value="0" style={{width: '60px', textAlign: 'center'}}>{sparlayToken()}</Radio.Button>
                          <Radio.Button value="1" style={{width: '60px', textAlign: 'center'}}>{sparlayFund()}</Radio.Button>
                          <Radio.Button value="2" >Both</Radio.Button>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col span={12} style={{textAlign: 'center'}}>
                        <Radio.Group defaultValue="0" size="large" value={this.state.challenge}>
                          <Radio.Button value="1" onClick={this.onChallenge} style={{width: '190px'}}>Challenge Your Friends</Radio.Button>
                        </Radio.Group>
                      </Col>
                      <Col span={12} style={{textAlign: 'center'}}>
                        <Radio.Group defaultValue="0" size="large" value={this.state.public}>
                          <Radio.Button value="1" onClick={this.onPublic} style={{width: '190px'}}>Bet Publicly</Radio.Button>
                        </Radio.Group>
                      </Col>
                    </Row>
                    <br/>

                    <label className="title">Friends Challenged ({this.state.sUsers.length * this.state.challenge})</label>
                    <div style={{textAlign: 'center'}}>
                      <Select
                        className="select-search"
                        mode="multiple"
                        labelInValue
                        placeholder="Search Friends"
                        value={this.state.sUsers}
                        filterOption={false}
                        notFoundContent={this.state.fetching ? <Spin size="small" /> : null}
                        onChange={this.onSelectUser}
                        onSearch={this.fetchUsers}
                        spellCheck={false}
                        disabled={this.state.challenge != '1'}
                      >
                        {this.state.users.map(u => (
                          <Option key={u.id}>{u.username}</Option>
                        ))}
                      </Select>
                    </div>

                    <Divider/>

                    <div>
                      <label className="ticket__summary__title">Summary</label>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Active Bets</label>
                        <label className="d-inline-block pull-right ticket__summary__sum">
                          {this.state.bets.length * (this.state.sUsers.length * this.state.challenge + parseInt(this.state.public))}
                        </label>
                      </div>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Amount Wagered</label>
                        {this.state.currency != '1' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayToken()} {numeral(parseFloat(this.state.totalBet) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))).format('0,0[.]00')}
                          </label>
                        ) : null}
                        {this.state.currency != '0' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayFund()} {numeral(parseFloat(this.state.totalBet) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public))).format('0,0[.]00')}
                          </label>
                        ) : null}
                      </div>
                      <div className="ticket__summary__value">
                        <label style={{marginLeft: '15px'}}>Potential Winnings</label>
                        {this.state.currency != '1' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayToken()} {formatNumber(parseFloat(this.state.totalWin) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public)))}
                          </label>
                        ) : null}
                        {this.state.currency != '0' ? (
                          <label className="d-inline-block pull-right ticket__summary__sum">
                            {sparlayFund()} {formatNumber(parseFloat(this.state.totalWin) * (this.state.sUsers.length * parseFloat(this.state.challenge) + parseFloat(this.state.public)))}
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="ticket__buttons">
                    <div className="row">
                      <Button className="col-lg-4 m-button" onClick={this.clearAll}>Clear All Bets</Button>
                      <div className="col-lg-4"></div>
                      <Button className="col-lg-4 y-button" onClick={this.placeBet}>Place Bet</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>


        <Modal
          className="prompt-invalid"
          visible={this.state.invalidOdds}
          title="Invalid Odds"
          onCancel={this.hideInvalidOdds}
          footer={[<Button className="ok" onClick={this.hideInvalidOdds}>OK</Button>]}
        >
          <div className="field">
            <label className="field__title">Sorry! The odds you entered are invalid.</label>
            <label className="field__title">Please enter a valid number.</label>
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
            <label className="field__title">You are attempting to create a bet with extreme odds. Are you sure you want to make this wager?</label>
          </div>
        </Modal>

      </div>
    )
  }
}

export default CreateBet
