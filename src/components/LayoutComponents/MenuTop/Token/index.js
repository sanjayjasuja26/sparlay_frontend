import React from 'react'
import { connect } from 'react-redux'
import numeral from 'numeral'
import { sparlayFund, sparlayToken } from 'siteGlobal/g'

const mapStateToProps = ({ app }) => {
  const { userState } = app
  return {
    token: userState.token,
    cash: userState.cash,
    user_id: userState.user_id,
  }
}


@connect(mapStateToProps)
class Token extends React.Component {

  render() {
    const token = (<img className="sparlay-coin" style={{marginBottom: '3px', marginRight: '0px'}} src="resources/images/sparlay_coin.png" alt=""/>)
    const { isMobile } = this.props
    return (
      <div className=" d-inline-block">
        {this.props.user_id !== '' ? (
          <div className={ isMobile ? "menuTop__token menuTop__token-m" : "menuTop__token" } >
            {sparlayFund()} <span className="menuTop__token__value" style={{marginRight: '10px'}}>{numeral(this.props.cash).format('0,0[.]00')} </span>
            {token} <span className="menuTop__token__value">{numeral(this.props.token).format('0,0[.]00')}</span>
          </div>
        ):(null)}
      </div>
    )
  }
}

export default Token
