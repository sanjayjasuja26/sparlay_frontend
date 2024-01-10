import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { setSiteState } from 'ducks/app'
import { sportImage, formatSpread, formatLine, formatTotal, getLocalTime, getLocalDate } from 'siteGlobal/g'

const mapStateToProps = ({ dispatch }) => {
	return {
		dispatch: dispatch
	}
}


@connect(mapStateToProps)
class Games extends React.Component {

	state = {
		games: this.props.games,
	}


	//********************* component ***********************//

	selectLine = (type, match, num) => {
		if (type === 'Line')
			if (match.line1 === '') return
		else if ( type === 'Spread')
			if (match.spread1 === '') return
		else if (type === 'O/U')
			if (match.total1 === '') return

		const { dispatch } = this.props
		dispatch(setSiteState({
			betSport: match.group_key,
			betLeague: match.league_id,
			betMatch: match,
			betType: type,
			betNum: num,
		}))
		dispatch(push('/create'))
	}

	componentWillReceiveProps(newProps) {
		this.setState({ games: newProps.games })
	}


	//********************* render ***********************//

	render() {
		const { isMobile } = this.props
		return (
			<div className="card-body">
				{this.state.games.length > 0 ? (
					<div>
						<div className="col-12 games-header-area no-padding">
							<label className="col-2 games-header" style={{'paddingLeft' : '0'}}>Time</label>
							<div className="col-10 d-inline-block" style={{'padding' : '0px 20px 0px 10px'}}>
								<label className= { isMobile ? "col-3 games-header" : "col-6 games-header" }
									style={{'textAlign' : 'left', 'paddingLeft' : '0'}}
								>
									Team
								</label>
								<label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Spread</label>
								<label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Money</label>
								<label className={ isMobile ? "col-3 games-header-m" : "col-2 games-header" }>Total</label>
							</div>
						</div>

						{this.state.games.map((game, index) =>
							<div key={index} className="col-12 no-padding games-value-area">
								<div className="row no-padding no-margin">
									<div className="col-2 games-time no-padding">
										<label className="games-time-val">{getLocalDate(game.utc)}</label>
										<label className="games-time-val" style={{'paddingTop' : '5px'}}>{getLocalTime(game.utc)}</label>
									</div>
									<div className="col-10 d-inline-block no-padding">
										<div className={ isMobile ? "row no-margin games-info-m" : "row no-margin games-info"}>
											<div className={ isMobile ? "col-3 games-team no-padding" : "col-6 games-team no-padding" }>
												<a><label className="games-team-sport">
													<img className="sport-small" alt=""
														src={sportImage(game.sport_key, 'blue')}
													/>
													{game.league_title}
												</label></a>
												<label className="games-team-name1">{game.team1}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
													onClick={this.selectLine.bind(this, 'Spread', game, 1)}
												>{formatSpread(game.point1, game.spread1)}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
													onClick={this.selectLine.bind(this, 'Line', game, 1)}
												>{formatLine(game.line1)}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
															 onClick={this.selectLine.bind(this, 'O/U', game, 1)}
												>{formatTotal('O', game.ou, game.total1)}</label>
											</div>
										</div>
										<div className={ isMobile ? "row no-margin games-info-m" : "row no-margin games-info"}>
											<div className={ isMobile ? "col-3 games-team-m no-padding" : "col-6 games-team no-padding" }>
												<label className={ isMobile ? "games-team-name2-m" : "games-team-name2" }>{game.team2}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
															 onClick={this.selectLine.bind(this, 'Spread', game, 2)}
												>{formatSpread(game.point2, game.spread2)}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
															 onClick={this.selectLine.bind(this, 'Line', game, 2)}
												>{formatLine(game.line2)}</label>
											</div>
											<div className={ isMobile ? "col-3 games-rect-m" : "col-2 games-rect" }>
												<label className="games-pointer"
															 onClick={this.selectLine.bind(this, 'O/U', game, 2)}
												>{formatTotal('U', game.ou, game.total2)}</label>
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