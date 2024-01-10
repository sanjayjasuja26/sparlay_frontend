import React from 'react'
import { connect } from 'react-redux'
import { push } from "react-router-redux"
import { Link } from "react-router-dom"
import axios from 'axios'
import qs from 'qs'
import numeral from 'numeral'
import { setDialogState } from 'ducks/app'
import { getDateTime, sparlayToken, sportImgs, sparlayFund } from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Table from 'antd/lib/table'
import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Tag from 'antd/lib/tag'
import List from 'antd/lib/list'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Statistic from 'antd/lib/statistic'

import './style.scss'

const { TabPane } = Tabs
const Search = Input.Search
const { Countdown } = Statistic


const mapStateToProps = ({ app }) => {
  const { userState , url } = app

  return {
    token: userState.token,
    cash: userState.cash,
    user_id: userState.user_id,
    url: url
  }
}

@connect(mapStateToProps)
class Lobby extends React.Component {

  state = {
    s_contest: {
      sports: 'football'
    },
    detail : {
      prizes: [
        {
          st: '',
          ed: '',
          prize: ''
        }
      ]
    },
    contests: [],

    detail_visible: false,
    sortInfo: {},
    search: '',

    entrants: []
  }


//******************************* Table ******************************//

  sortTable = (pagination, filters, sorter) => {
    this.setState({
      sortInfo: sorter,
    })
  }

  enterContest = (c_id) => {
    const { dispatch } = this.props
    dispatch(push('/pick?contest=' + c_id))
  }


//******************************* Modal *******************************//

  showDetail = (contest) => {
    this.setState({
      s_contest: contest,
      detail_visible: true,
      search: ''
    })

    this.fetchDetail(contest.id)
  }

  hideDetail = () => {
    this.setState({
      detail_visible: false,
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


//******************************* Component ***************************//

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

  fetchContests = () => {
    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/contest/lobby',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({u_id: this.props.user_id})
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to Fetch contests:')
          console.log(res.data.err)
          return false
        } else if (res.data.res === 'success'){
          _this.setState({
            contests: res.data.contests
          })
          return true
        }
      })
      .catch(function (error) {
        console.log(error)
        return false
      })
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
          console.log('Failed to Fetch contest detail:')
          console.log(res.data.err)
          return false
        } else if (res.data.res === 'success'){
          _this.setState({
            detail: res.data.detail
          }, _this.searchEntrants)
          return true
        }
      })
      .catch(function (error) {
        console.log(error)
        return false
      })
  }

  componentDidMount() {
    this.fetchContests()
  }


//******************************* Render ******************************//

  render() {
    const { isMobile } = this.props
    let { sortInfo } = this.state
    const columns_entrant = [
      {
        title: 'Usrname',
        dataIndex: 'e1',
        width: '33.3%',
        className: 'col-left',
        render: (e) => {
          return (e.username)
        }
      },
      {
        title: 'Username',
        dataIndex: 'e2',
        width: '33.3%',
        className: 'col-left',
        render: (e) => {
          return (e.username)
        }
      },
      {
        title: 'Username',
        dataIndex: 'e3',
        className: 'col-left',
        render: (e) => {
          return (e.username)
        }
      },
    ]
    var columns = [
      {
        title: 'Sports',
        dataIndex: 'sports',
        key: 'sports',
        className: 'col-left col-sport',
        render: (sport, contest) => {
          return (sportImgs(contest.sports))
        }
      },
      {
        title: 'Contest',
        dataIndex: 'title',
        key: 'title',
        className: 'col-left'
      },
      {
        title: 'Entry Fee',
        dataIndex: 'fee_cash',
        key: 'fee_cash',
        align: 'right',
        width: '15%',
        sorter: (a, b) => parseFloat(a.fee_cash) - parseFloat(b.fee_cash),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'fee_cash' && sortInfo.order,
        render: (fee_cash, contest) => {
            return (this.renderFee(contest))
        }
      },
      {
        title: 'Total Prizes',
        dataIndex: 'total',
        key: 'total',
        align: 'right',
        width: '10%',
        sorter: (a, b) => parseFloat(a.total) - parseFloat(b.total),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'total' && sortInfo.order,
        render: total => {
          return (
            <label>{sparlayFund()}{numeral(total).format('0,0[.]00')}</label>
          )
        }
      },
      {
        title: 'Entries',
        dataIndex: 'entries',
        key: 'entries',
        align: 'right',
        width: '8%',
        sorter: (a, b) => parseFloat(a.entries) - parseFloat(b.entries),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'entries' && sortInfo.order,
        render: (entries, contest) => {
          return contest.entrants + ' / ' + entries
        }
      },
      {
        title: 'Start',
        dataIndex: 'start',
        key: 'start',
        align: 'right',
        width: '10%',
        sorter: (a, b) => a.start - b.start,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortInfo.columnKey === 'start' && sortInfo.order,
        render: start => {
          return getDateTime(start)
        }
      },
      {
        title: 'End',
        dataIndex: 'end',
        key: 'end',
        align: 'right',
        width: '10%',
        sorter: (a, b) => a.end - b.end,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortInfo.columnKey === 'end' && sortInfo.order,
        render: end => {
          return getDateTime(end)
        }
      },
      {
        title: '',
        dataIndex: 'status',
        className: 'col-center',
        width: '12%',
        render: (status, contest) => {
          if (parseInt(contest.entries) == parseInt(contest.entrant)) {
            return (<Tag className="tag" color="volcano">LOCKED</Tag>)
          } else {
            return (
              <Button
                className="y-button"
                onClick={(e) => {
                  e.stopPropagation()
                  this.enterContest(contest.id)
                }}
              >ENTER</Button>)
          }
        }
      },
    ]
    if (isMobile) {
      columns = [
        {
          title: 'Sports',
          dataIndex: 'sports',
          key: 'sports',
          className: 'col-left',
          render: (sport, contest) => {
            return (sportImgs(contest.sports))
          }
        },
        {
          title: 'Entry Fee',
          dataIndex: 'fee_cash',
          key: 'fee_cash',
          align: 'right',
          sorter: (a, b) => parseFloat(a.fee_cash) - parseFloat(b.fee_cash),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortInfo.columnKey === 'fee_cash' && sortInfo.order,
          render: (fee_cash, contest) => {
            return (this.renderFee(contest))
          }
        },
        {
          title: '',
          dataIndex: 'status',
          className: 'col-center',
          width: '12%',
          render: (status, contest) => {
            if (parseInt(contest.entries) == parseInt(contest.entrant)) {
              return (<Tag className="tag" color="volcano">LOCKED</Tag>)
            } else {
              return (
                <Button
                  className="y-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.enterContest(contest.id)
                  }}
                >ENTER</Button>)
            }
          }
        },
      ]
    }

    const balance = (
      <h5>
        Balance: {sparlayFund()}{numeral(this.props.cash).format('0,0[.]00')}
        {sparlayToken()}{numeral(this.props.token).format('0,0[.]00')}
      </h5>
    )

    return (
      <div className="lobby">

        <div className="row">
          <div className={ isMobile ? "col-md-12 col-lg-12 no-padding" : "col-md-12 col-lg-12" }>

            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  <img src="resources/images/open.png" alt=""/>
                  <h4 className="d-inline-block"> Sparlay Contest Lobby</h4>
                </div>
              </div>
              <div className={ isMobile ? "card-body mobile-body" : "card-body desktop-body" }>
                <div className="row">
                  <div className={ isMobile ? "col-12" : "lobby__contests" }>
                    <Table
                      className="ant-table-dark lobby__table"
                      columns={columns}
                      dataSource={this.state.contests}
                      onChange={this.sortTable}
                      rowKey="id"
                      onRow={(record, rowIndex) => {
                        return {
                          onClick: (e) => {
                            this.showDetail(record)
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <Modal
          className={isMobile? "modal_detail modal_detail-m":"modal_detail"}
          visible={this.state.detail_visible}
          title={this.state.s_contest.title}
          onCancel={this.hideDetail}
          footer={[]}
        >
          {isMobile? (
            <div className="detail_header">
              <div>
                <Countdown title="Contest Start" value={parseInt(this.state.s_contest.start)}/>
                <h4>{getDateTime(this.state.s_contest.start)}</h4>
              </div>
              <div className="card">
                <div className="card-body">
                  <h5>Fee: {this.renderFee(this.state.s_contest)}</h5>
                  <div className="row no-margin">
                    <h5 className="col-7 no-padding">Prizes: {sparlayFund()}{numeral(this.state.s_contest.total).format('0,0')}</h5>
                    <h5 className="col-5 no-padding">Sports: {sportImgs(this.state.s_contest.sports)}</h5>
                  </div>
                  <h5>Entrants: {this.state.s_contest.entrants} / {this.state.s_contest.entries}</h5>
                  <h5>Leagues: {this.state.s_contest.leagues}</h5>
                </div>
              </div>
            </div>
          ):(
            <div className="detail_header">
              <Row>
                <Col span={6}>
                  <Countdown title="Contest Start" value={parseInt(this.state.s_contest.start)}/>
                  <h4>{getDateTime(this.state.s_contest.start)}</h4>
                </Col>
                <Col span={18}>
                  <div className="card">
                    <div className="card-body">
                      <Row>
                        <Col span={15}>
                          <h5>Fee: {this.renderFee(this.state.s_contest)}</h5>
                          <h5>Entrants: {this.state.s_contest.entrants} / {this.state.s_contest.entries}</h5>
                        </Col>
                        <Col span={9}>
                          <h5>Prizes: {sparlayFund()}{numeral(this.state.s_contest.total).format('0,0')}</h5>
                          <h5>Sports: {sportImgs(this.state.s_contest.sports)}</h5>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <h5>Leagues: {this.state.s_contest.leagues}</h5>
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
                          This {this.state.s_contest.entries} - user contest features
                          {sparlayFund()}{numeral(this.state.s_contest.total).format('0,0[.].00')} in total prizes and pays out the top
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
                        <h4 style={{marginLeft: '0px'}}>Entrants</h4>
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
      </div>
    )
  }
}

export default Lobby
