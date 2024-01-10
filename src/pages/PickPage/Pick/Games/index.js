import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { setSiteState } from 'ducks/app'
import { sportImage } from 'siteGlobal/g'

const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const mapStateToProps = ({ dispatch }) => {
  return {
    dispatch: dispatch,
  }
}

@connect(mapStateToProps)
class Games extends React.Component {

	state = {
		picks: this.props.picks,
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			picks: newProps.picks,
		})
	}

	getLocalTime = (utc) => {
		let d = new Date(parseInt(utc, 10))
		let h = d.getHours()
		let m = d.getMinutes()
		if (h < 10) {
			h = '0' + h
		}
		if (m < 10) {
			m = '0' + m
		}

		return h + ':' + m
	}

	getLocalDate = (utc) => {
		let d = new Date(parseInt(utc, 10))
		let m = d.getMonth()
		let dd = d.getDate()
		return month[m] + ' ' + dd.toString()
	}

	formatSpread = (point, spread) => {
		if (point === '') return ''

		let p = point
		if (parseFloat(point) === 0) p = 'PK'

		let s = spread

		return p + '(' + s + ')'
	}

	formatTotal = (head, ou, total) => {
		if (ou === '') return ''

		return head + ou +'(' + total + ')'
	}

	selectLine = (index, type, team) => {
		let picks = this.state.picks
		picks[index][type] = team
		this.setState({picks: picks})

		this.props.pick(picks)
	}


	render() {
  		const { isMobile } = this.props
	    return (
	      <div className="card-body">
	      	{this.state.picks.length > 0 ? (
	      		<div>
			        <div className="col-12 games-header-area no-padding">
			          <label 
			            className="col-2 games-header"
			            style={{'paddingLeft' : '0'}}
			          >
			            Time
			          </label>
			          <div 
			            className="col-10 d-inline-block"
			            style={{'padding' : '0px 20px 0px 10px'}}
			          >
			            <label
			              className= { isMobile ? "col-3 games-header" : "col-6 games-header" }
			              style={{'textAlign' : 'left', 'paddingLeft' : '0'}}
			            >
			              Team
			            </label>
			            <label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Spread</label>
			            <label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Money</label>
			            <label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Total</label>
			          </div>
			        </div>

			        {this.props.games.map((game, index) =>
				        <div key={index} className="col-12 no-padding games-value-area">
				          <div className="row no-padding no-margin">
				            <div className="col-2 games-time no-padding">
				              	<label className="games-time-val">{this.getLocalDate(game.utc)}</label>
												<label className="games-time-val" style={{'paddingTop' : '5px'}}>{this.getLocalTime(game.utc)}</label>
				            </div>

										<div className="col-10 d-inline-block no-padding">
											<div className={ isMobile ? "row no-margin games-info-m" : "row no-margin games-info"}>
												<div className={ isMobile ? "col-3 games-team no-padding" : "col-6 games-team no-padding" }>
													<a><label className="games-team-sport">
														<img className="sport-small" alt="" src={sportImage(game.sport_key, 'blue')} />
														{game.league_title}
													</label></a>
													<label className="games-team-name1">{game.team1}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].spread == '1' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'spread', '1')}
													>{this.formatSpread(game.point1, game.spread1)}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].line == '1' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'line', '1')}
													>{game.line1}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].total == '1' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'total', '1')}
													>{this.formatTotal('O', game.ou, game.total1)}</label>
												</div>
											</div>
											<div className={ isMobile ? "row no-margin games-info-m" : "row no-margin games-info"}>
												<div className={ isMobile ? "col-3 games-team-m no-padding" : "col-6 games-team no-padding" }>
													<label className={ isMobile ? "games-team-name2-m" : "games-team-name2" }>{game.team2}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].spread == '2' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'spread', '2')}
													>{this.formatSpread(game.point2, game.spread2)}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].line == '2' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'line', '2')}
													>{game.line2}</label>
												</div>
												<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
													<label className={this.state.picks[index].total == '2' ? "games-pointer picked": "games-pointer"}
																 onClick={this.selectLine.bind(this, index, 'total', '2')}
													>{this.formatTotal('U', game.ou, game.total2)}</label>
												</div>
											</div>
									</div>

				          </div>
				        </div>
			        )}
		        </div>
	      	) : (
	      		<div className="no_games">
		      		<p>
		      			There are no available contests on this day.
		      		</p>
		      		<p>
		      			Please check back later, or choose a different date.
		      		</p>
	      		</div>
	      	)}
	      </div>
	    )
  	}
}

export { Games }