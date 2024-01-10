import React from "react"
import numeral from 'numeral'

import Tooltip from 'antd/lib/tooltip'
import Tag from 'antd/lib/tag'

export var years = []
for (let i = 1998; i >= 1940; i--) years.push(i)
export var dates = []
for (let i = 1; i < 32; i++) dates.push(i)

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getDateTime = (tm) => {
    if (isNaN(parseInt(tm, 10))) return ''

    return getLocalDate(tm) + ' ' + getLocalTime(tm)
}

export const getLocalDate = (tm) => {
    if (isNaN(parseInt(tm, 10))) return ''

    let d = new Date(parseInt(tm, 10))
    let now = new Date()
    if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth())
        return 'Today'
    else
        return months[d.getMonth()] + ' ' + d.getDate()
}

export const getLocalTime = (tm) => {
    if (isNaN(parseInt(tm, 10))) return ''

    let d = new Date(parseInt(tm, 10))
    var h = d.getHours()
    var m = d.getMinutes()
    if (h < 10) h = '0' + h
    if (m < 10) m = '0' + m

    return h + ':' + m
}


export const sparlayToken = () => {
    return (<img className="sparlay-coin" style={{marginBottom: '3px'}} src="resources/images/sparlay_coin.png" alt=""/>)
}

export const sparlayFund = () => {
    return (<span className="sparlay-fund">$</span>)
}

export const sportImage = (sport, color = 'white') => {
    if (sport == '' || sport == undefined) {
        return ""
    }

    let suffix = '.png'
    if (color == 'blue') {
        suffix = '_b.png'
    } else if (color == 'black') {
        suffix = '_d.png'
    }
    return "resources/images/sports/" + sport.toLowerCase() + suffix
}

export const sportImgs = (sports) => {
    if (sports == '' || sports == undefined) return ('')
    return (
      <label>
          {sports.split(',').map((sport, index) =>
            <img key={index} className="sport-small" alt="" src={sportImage(sport, 'black')} />
          )}
      </label>
    )
}


export const formatSpread = (point, spread) => {
    if (isNaN(parseInt(spread))) return ''
    return formatPoint(point) + '(' + spread + ')'
}

export const formatLine = (line) => {
    if (isNaN(parseInt(line))) return ''
    return line
}

export const formatTotal = (head, ou, total) => {
    if (isNaN(parseFloat(ou))) return ''
    return head + ou +'(' + total + ')'
}

export const formatPoint = (v) => {
    if (isNaN(parseFloat(v))) return ''

    let val = parseFloat(v)

    if (val == 0) {
        return 'PK'
    } else if (val > 0 ) {
        return '+' + val.toString()
    } else {
        return val.toString()
    }
}

export const formatOdds = (v) => {
    if (isNaN(parseInt(v))) return ''

    let val = parseInt(v)
    if (val > 0 ) {
        return '+' + val.toString()
    } else {
        return val.toString()
    }
}

export const formatNumber = (v, type = 'show') => {
  if (v == '' && type != 'show'){
    return ''
  }

  if (isNaN(v)) {
      if (type == 'show') {
        return '0'
      } else {
        return ''
      }
  }

  let ov = v.toString()
  let counter = 0
  let val = ov.replace(/[^0-9.]|\./g, function($0){
    if($0 == "." && !(counter++))
        return "."
    return ""
  })
  let sv = val.split('.')
  if (type == 'show') {
    return numeral(val).format('0,0.00')
  } else {
    if (sv.length > 1) {
      if (sv[1].length > 1) {
        return numeral(val).format('0,0.00')
      } else if (sv[1].length > 0) {
        return numeral(val).format('0,0.0')
      } else {
        return numeral(val).format('0,0') + '.'
      }
    } else {
      return numeral(val).format('0,0')
    }
  }
}


export const getOpponent = (b) => {
    let bet = cloneHash(b)

    bet.point = formatPoint(-parseFloat(bet.point))
    bet.odds = formatOdds(-parseInt(bet.odds))
    bet.bet = bet.fee

    if (bet.type == 'Parlay') {
        bet.teamData = 'Parlay'
    } else {
        if (bet.bet_type == 'O/U') {
            bet.team = bet.team == 'Over'? 'Under' : 'Over'
        } else {
            bet.team = bet.team == bet.team1? bet.team2 : bet.team1
        }
        bet.teamData = teamData(bet.bet_type, bet.team, bet.point)
    }

    if (b.accept > 0) {
        bet.accept = -1
    } else {
        bet.accept = 1
    }

    return bet
}



export const teamData = (type, team, p) => {
    let point = parseFloat(p)
    if (type === 'Line') {
        return team
    } else if (type == 'O/U') {
        if (point < 0) point = -point
    } else if (type == 'Spread') {
        point = p
    }
    return team + ' ' + point
}

export const oddsData = (type, point, odds) => {
    if (type == 'Line') {
        return formatOdds(odds)
    } else if (type == 'O/U') {
        if (point < 0) point = -point
        return point + '(' + odds + ')'
    } else {
        return formatSpread(point, odds)
    }
}


export const renderOverviewTitle = (accept, status = 'accepted') => {
    if (parseInt(accept, 10) > 1) {
      return (
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Bet Overview &nbsp;&nbsp;
          <Tooltip title={"You accepted this contest."}>
            <i className="fa fa-info-circle"/>
          </Tooltip>
        </span>
      )
    } else if (parseInt(accept, 10) > 0) {
      return (
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Bet Overview &nbsp;&nbsp;
          <Tooltip title={"You will accept this contest."}>
            <i className="fa fa-info-circle"/>
          </Tooltip>
        </span>
      )
    } else {
      return (
        <span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Bet Overview &nbsp;&nbsp;
          <Tooltip title="You created this contest.">
            <i className="fa fa-info-circle"/>
          </Tooltip>
        </span>
      )
    }
}

export const renderBetResult = (result) => {
    if (result == '' || result == undefined) return null

    let color = 'geekblue'
    if (result === 'win')
        color = 'green'
    else if (result === 'loss')
        color = 'red'
    else if (result === 'not accepted')
        color = 'purple'

    return ( <Tag className="tag-result" color={color}>{result.toUpperCase()}</Tag> )
}

export const renderCurrency = (currency, v, v2 = '0') => {
    if (currency == '0') {
        return ( <label style={{fontWeight: '600'}}>{sparlayToken()}{formatNumber(v)}</label> )
    } else if (currency == '1') {
        return ( <label style={{fontWeight: '600'}}>{sparlayFund()}{formatNumber(v)}</label> )
    } else if (currency == '2') {
        return (
            <label style={{fontWeight: '600'}}>
                {sparlayFund()}{formatNumber(v)}
                <span style={{margin: '0 3px', color: '#bfbfbf'}}> OR </span>
                {sparlayToken()}{formatNumber(v2)}
            </label>
        )
    }
}


export const cap = (v) => {
    return v.charAt(0).toUpperCase() + v.slice(1)
}


export const cloneHash = (o) => {
    let n = {}
    for (let key in o) {
        n[key] = o[key]
    }
    return n
}


export const checkEmail = (email) => {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i)
    if (pattern.test(email)) {
        return true
    } else {
        return false
    }
}


export const copyLink = (url) => {
    let textarea = document.createElement('textarea')
    textarea.value = url
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
}


const invalidCountry = 'US,VE,CU,KP,IR,SY'
export const invalidLocation = () => {
  let location = JSON.parse(window.localStorage.getItem('sparlay.location'))
  if (invalidCountry.includes(location.country)) {
    return true
  }

  return false
}
