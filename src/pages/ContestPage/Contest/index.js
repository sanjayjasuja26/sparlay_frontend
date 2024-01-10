import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link } from 'react-router-dom'
import axios from 'axios'
import qs from 'qs'
import numeral from 'numeral'
import { setDialogState } from 'ducks/app'
import { getDateTime, sparlayToken, sparlayFund, sportImgs } from 'siteGlobal/g'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio'
import Table from 'antd/lib/table'
import Modal from 'antd/lib/modal'
import Tabs from 'antd/lib/tabs'
import Tag from 'antd/lib/tag'
import Drawer from 'antd/lib/drawer'
import message from 'antd/lib/message'
import List from 'antd/lib/list'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Statistic from 'antd/lib/statistic'

import './style.scss'

const InputGroup = Input.Group
const Search = Input.Search
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const { TabPane } = Tabs
const { Countdown } = Statistic

const mapStateToProps = ({ app }, props) => {
  const { userState , url, siteState } = app

  return {
    userState: userState,
    url: url,
    user_id: userState.user_id,
    token: userState.token,
    cash: userState.cash,
  }
}


@connect(mapStateToProps)
class Contest extends React.Component {

  state = {
    next_start: Date.now(),
    winnings: 0,

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
    entrants: [],

    filterDrawer: false,
    detail_visible: false,
    sortInfo: {},
    search: '',

    status: 'live',
    titleWinning: 'Possible Winnings',
    titleContest: 'Live Contests'
  }


//******************************* Filter ******************************//

  onStatus = (e) => {
    let cat = e.target.value
    let titleWinning = '', titleContest = ''
    if (cat == 'live') {
      titleWinning = 'Possible Winnings'
      titleContest = 'Live Contests'
    } else if (cat == 'upcoming') {
      titleWinning = 'Possible Winnings'
      titleContest = 'Upcoming Contests'
    } else if (cat == 'end') {
      titleWinning = 'Total Winnings'
      titleContest = 'Total Contests'
    }

    this.setState({
      status: e.target.value,
      titleWinning: titleWinning,
      titleContest: titleContest,
      winnings: 0,
      contests: []
    }, this.fetchContests)
  }

  clearSearch = () => {
    this.setState({
      status: 'live',
      titleWinning: 'Possible Winnings',
      titleContest: 'Live Contests',
      winnings: 0,
      contests: [],
      filterDrawer: false
    }, this.fetchContests)
  }

  calWinnings = () => {
    let winnings = 0
    for (let c of this.state.contests) {
      if (this.state.status == 'end') {
        winnings += parseFloat(c.r_win)
      } else {
        winnings += parseFloat(c.a_win)
      }
    }
    this.setState({winnings: winnings})
  }

//******************************* Table ******************************//

  sortTable = (pagination, filters, sorter) => {
    this.setState({
      sortInfo: sorter,
    })
  }

  editContest = (c_id) => {
    const { dispatch } = this.props
    dispatch(push('/pick?contest=' + c_id))
  }

  copyLink = (c_id) => {
    var textarea = document.createElement('textarea')
    textarea.value = 'https://playsparlay.com/pick?contest=' + c_id
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success('Copied!')
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
      url: this.props.url + '/contest/search',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({u_id: this.props.user_id, status: this.state.status})
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to Fetch contests:')
          console.log(res.data.err)
          return false
        } else if (res.data.res === 'success'){
          let next_start = res.data.next_start
          if (next_start == '0') {
            next_start = Date.now()
          }
          _this.setState({
            contests: res.data.contests
          }, _this.calWinnings)
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
        } else if (res.data.res === 'success'){
          _this.setState({
            detail: res.data.detail
          }, _this.searchEntrants)
        }
      })
      .catch(function (error) {
        console.log(error)
        return false
      })
  }

  componentDidMount() {
    this.fetchContests()

    var _this = this
    axios({
      method: 'post',
      url: this.props.url + '/contest/user_status',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({u_id: this.props.user_id})
    })
      .then(function (res) {
        if (res.data.res === 'fail'){
          console.log('Failed to Fetch contests/user_status:', res.data.err)
        } else if (res.data.res === 'success'){
          let next_start = res.data.next_start
          if (next_start == '0') {
            next_start = Date.now()
          }
          _this.setState({
            next_start: next_start
          })
        }
      })
      .catch(function (error) {
        console.log(error)
        return false
      })
  }


//******************************* Drawer ******************************//

  showDrawer = () => {
    this.setState({
      filterDrawer: true
    })
  }

  closeDrawer = () => {
    this.setState({
      filterDrawer: false
    })
  }


//******************************* Render ******************************//

  render() {
    const { isMobile } = this.props
    var { sortInfo } = this.state
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
    var columns_live = [
      {
        title: '',
        dataIndex: '',
        key: 'span_live',
        width: '2%',
      },
      {
        title: 'Contest',
        dataIndex: 'title',
        key: 'title_live',
        align: 'left',
      },
      {
        title: 'Place',
        dataIndex: 'rank',
        key: 'rank_live',
        align: 'right',
        width: '10%',
        sorter: (a, b) => parseFloat(a.rank) - parseFloat(b.rank),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'rank_live' && sortInfo.order,
        render: rank => {
          return (
              <label>{numeral(rank).format('0o')}</label>
          )
        }
      },
      {
        title: 'PTS',
        dataIndex: 'pt',
        key: 'pt_live',
        align: 'right',
        width: '10%',
        sorter: (a, b) => parseFloat(a.pt) - parseFloat(b.pt),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'pt_live' && sortInfo.order
      },
      {
        title: 'Remaining',
        dataIndex: 'remain',
        key: 'remain_live',
        align: 'right',
        sorter: (a, b) => parseFloat(a.remain) - parseFloat(b.remain),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'remain_live' && sortInfo.order,
      },
      {
        title: 'Entry Fee',
        dataIndex: 'fee_cash',
        key: 'fee_live',
        align: 'right',
        sorter: (a, b) => parseFloat(a.fee_cash) - parseFloat(b.fee_cash),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'fee_live' && sortInfo.order,
        render: (fee_cash, contest) => {
          return (
            this.renderFee(contest)
          )
        }
      },
      {
        title: 'Top Prize',
        dataIndex: 'a_win',
        key: 'top_live',
        align: 'right',
        sorter: (a, b) => parseFloat(a.a_win) - parseFloat(b.a_win),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'top_live' && sortInfo.order,
        render: a_win => {
          return (
            <label style={{marginRight: '10px'}}>{sparlayFund()}{numeral(a_win).format('0,0[.]00')}</label>
          )
        }
      }
    ]
    var columns_upcoming = [
      {
        title: '',
        dataIndex: '',
        key: 'span_upcoming',
        width: '2%',
      },
      {
        title: 'Contest',
        dataIndex: 'title',
        key: 'title_upcoming',
        align: 'left',
      },
      {
        title: 'Edit',
        dataIndex: 'id',
        align: 'center',
        key: 'edit_upcoming',
        width: '10%',
        render: (id) => {
          return (
            <Button
              className="y-button"
              onClick={(e) => {
                e.stopPropagation()
                this.editContest(id)
              }}
            >Edit</Button>
          )
        }
      },
      {
        title: 'Invite',
        dataIndex: 'id',
        align: 'center',
        key: 'invite_upcoming',
        width: '5%',
        render: (id) => {
          return (
            <Button
              className="y-button"
              onClick={(e) => {
                e.stopPropagation()
                this.copyLink(id)
              }}
            >+</Button>
          )
        }
      },
      {
        title: 'Start',
        dataIndex: 'start',
        key: 'start_upcoming',
        align: 'right',
        sorter: (a, b) => a.start - b.start,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortInfo.columnKey === 'start_upcoming' && sortInfo.order,
        render: start => {
          return getDateTime(start)
        }
      },
      {
        title: 'End',
        dataIndex: 'end',
        key: 'end_upcoming',
        align: 'right',
        sorter: (a, b) => a.end - b.end,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortInfo.columnKey === 'end_upcoming' && sortInfo.order,
        render: end => {
          return getDateTime(end)
        }
      },
      {
        title: 'Entries',
        dataIndex: 'entries',
        key: 'entry_upcoming',
        align: 'right',
        sorter: (a, b) => parseFloat(a.entries) - parseFloat(b.entries),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'entry_upcoming' && sortInfo.order,
        render: (entries, contest) => {
          return contest.entrants + ' / ' + entries
        }
      },
      {
        title: 'Entry Fee',
        dataIndex: 'fee_cash',
        key: 'fee_upcoming',
        align: 'right',
        sorter: (a, b) => parseFloat(a.fee_cash) - parseFloat(b.fee_cash),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'fee_upcoming' && sortInfo.order,
        render: (fee_cash, contest) => {
          return (
            this.renderFee(contest)
          )
        }
      },
      {
        title: 'Top Prize',
        dataIndex: 'a_win',
        key: 'top_upcoming',
        align: 'right',
        sorter: (a, b) => parseFloat(a.a_win) - parseFloat(b.a_win),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'top_upcoming' && sortInfo.order,
        render: a_win => {
          return (
            <label style={{marginRight: '10px'}}>{sparlayFund()}{numeral(a_win).format('0,0[.]00')}</label>
          )
        }
      }
    ]
    var columns_history = [
      {
        title: '',
        dataIndex: '',
        key: 'span_history',
        width: '2%',
      },
      {
        title: 'Contest',
        dataIndex: 'title',
        key: 'title_history',
        align: 'left',
      },
      {
        title: 'Place',
        dataIndex: 'rank',
        key: 'rank_history',
        align: 'right',
        width: '10%',
        sorter: (a, b) => parseFloat(a.rank) - parseFloat(b.rank),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'rank_history' && sortInfo.order,
        render: rank => {
          return (
              <label>{numeral(rank).format('0o')}</label>
          )
        }
      },
      {
        title: 'PTS',
        dataIndex: 'pt',
        key: 'pt_history',
        align: 'right',
        width: '10%',
        sorter: (a, b) => parseFloat(a.pt) - parseFloat(b.pt),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'pt_history' && sortInfo.order
      },
      {
        title: 'Won',
        dataIndex: 'r_win',
        key: 'win_history',
        align: 'right',
        sorter: (a, b) => parseFloat(a.r_win) - parseFloat(b.r_win),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'win_history' && sortInfo.order,
        render: r_win => {
          return (
              <label>{sparlayFund()}{r_win}</label>
          )
        }
      },
      {
        title: 'Completed',
        dataIndex: 'end',
        key: 'end_history',
        align: 'right',
        sorter: (a, b) => a.end - b.end,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sortInfo.columnKey === 'end_history' && sortInfo.order,
        render: end => {
          return getDateTime(end)
        }
      },
      {
        title: 'Entry Fee',
        dataIndex: 'fee_cash',
        key: 'fee_history',
        align: 'right',
        sorter: (a, b) => parseFloat(a.fee_cash) - parseFloat(b.fee_cash),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'fee_history' && sortInfo.order,
        render: (fee_cash, contest) => {
          return (
            this.renderFee(contest)
          )
        }
      },
      {
        title: 'Top Prize',
        dataIndex: 'a_win',
        key: 'top_history',
        align: 'right',
        sorter: (a, b) => parseFloat(a.a_win) - parseFloat(b.a_win),
        sortDirections: ['descend', 'ascend'],
        sortOrder: sortInfo.columnKey === 'top_history' && sortInfo.order,
        render: a_win => {
          return (
            <label style={{marginRight: '10px'}}>{sparlayFund()}{numeral(a_win).format('0,0[.]00')}</label>
          )
        }
      }
    ]
    if (isMobile) {
      columns_live = [
        {
          title: 'Contest',
          dataIndex: 'title',
          key: 'title_live',
          align: 'left',
        },
        {
          title: 'Place',
          dataIndex: 'rank',
          key: 'rank_live',
          align: 'right',
          sorter: (a, b) => parseFloat(a.rank) - parseFloat(b.rank),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortInfo.columnKey === 'rank_live' && sortInfo.order,
          render: rank => {
            return (
              <label>{numeral(rank).format('0o')}</label>
            )
          }
        },
        {
          title: 'PTS',
          dataIndex: 'pt',
          key: 'pt_live',
          align: 'right',
          sorter: (a, b) => parseFloat(a.pt) - parseFloat(b.pt),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortInfo.columnKey === 'pt_live' && sortInfo.order
        }
      ]
      columns_upcoming = [
        {
          title: 'Contest',
          dataIndex: 'title',
          key: 'title_upcoming',
          align: 'left',
        },
        {
          title: 'Edit',
          dataIndex: 'id',
          align: 'center',
          key: 'edit_upcoming',
          width: '10%',
          render: (id) => {
            return (
              <Button
                className="y-button"
                onClick={(e) => {
                  e.stopPropagation()
                  this.editContest(id)
                }}
              >Edit</Button>
            )
          }
        },
        {
          title: 'Invite',
          dataIndex: 'id',
          align: 'center',
          key: 'invite_upcoming',
          width: '5%',
          render: (id) => {
            return (
              <Button
                className="y-button"
                onClick={(e) => {
                  e.stopPropagation()
                  this.copyLink(id)
                }}
              >+</Button>
            )
          }
        }
      ]
      columns_history = [
        {
          title: 'Contest',
          dataIndex: 'title',
          key: 'title_history',
          align: 'left',
        },
        {
          title: 'Place',
          dataIndex: 'rank',
          key: 'rank_history',
          align: 'right',
          sorter: (a, b) => parseFloat(a.rank) - parseFloat(b.rank),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortInfo.columnKey === 'rank_history' && sortInfo.order,
          render: rank => {
            return (
              <label>{numeral(rank).format('0o')}</label>
            )
          }
        },
        {
          title: 'Won',
          dataIndex: 'r_win',
          key: 'win_history',
          align: 'right',
          sorter: (a, b) => parseFloat(a.r_win) - parseFloat(b.r_win),
          sortDirections: ['descend', 'ascend'],
          sortOrder: sortInfo.columnKey === 'win_history' && sortInfo.order,
          render: r_win => {
            return (
              <label>{sparlayFund()}{r_win}</label>
            )
          }
        }
      ]
    }

    const balance = (
      <h5>
        Balance: {sparlayFund()}{numeral(this.props.cash).format('0,0[.]00')},
        {sparlayToken()}{numeral(this.props.token).format('0,0[.]00')}
      </h5>
    )


    return (
      <div className="my_contests">

        <div className="row">
          <div className={ isMobile ? "col-md-12 col-lg-12 no-padding" : "col-md-12 col-lg-12" }>

            <div className="card">
              <div className="card-header">
                <div className="utils__title">
                  {!isMobile ? (
                    <label className="pull-right">Next Contest Starts In : <Countdown value={parseInt(this.state.next_start)}/></label>
                  ) : (
                    <a className="pull-right filter" onClick={this.showDrawer}>Filter</a>
                  )}
                  <img src="resources/images/open.png" alt=""/>
                  <h4 className="d-inline-block"> My Contests</h4>
                  {isMobile ? (
                    <label className="text-center" style={{width: '100%', marginTop: '10px'}}>Next Contest Starts In : <Countdown value={parseInt(this.state.next_start)}/></label>
                  ) : null}
                </div>
              </div>

              <div className={ isMobile ? "card-body mobile-body" : "card-body desktop-body" }>
                <div className="row">
                  {!isMobile ? (
                    <div className="my_contests__search">

                      <div className="card" style={{marginTop: '10px'}}>
                        <div className="card-body">
                          <h4 className="title">{this.state.titleWinning}</h4>
                          <h4 className="value">{sparlayFund()}{numeral(this.state.winnings).format('0,0[.]00')}</h4>
                          <h4 className="title">{this.state.titleContest}</h4>
                          <h4 className="value">{this.state.contests.length}</h4>
                        </div>
                      </div>

                      <RadioGroup defaultValue="live" value={this.state.status} size="large" className="my_contests__search__sel" onChange={this.onStatus}>
                        <RadioButton value="live" className="my_contests__search__sel__bet">Live</RadioButton>
                        <RadioButton value="upcoming" className="my_contests__search__sel__bet">Upcoming</RadioButton>
                        <RadioButton value="end" className="my_contests__search__sel__bet">History</RadioButton>
                      </RadioGroup>

                      <div className="my_contests__search__clear">
                        <a onClick={this.clearSearch}>Reset Filters</a>
                      </div>
                    </div>
                  ) : null }

                  <div className={ isMobile ? "col-12" : "my_contests__contests" }>
                    { this.state.status == 'live' ? (
                      <Table
                        className="ant-table-dark my_contests__table"
                        columns={columns_live}
                        dataSource={this.state.contests}
                        rowKey="id"
                        onChange={this.sortTable}
                        onRow={(record, rowIndex) => {
                          return {
                            onClick: (e) => {
                              this.showDetail(record)
                            }
                          }
                        }}
                      />
                    ) : null }

                    { this.state.status == 'upcoming' ? (
                      <Table
                        className="ant-table-dark my_contests__table"
                        columns={columns_upcoming}
                        dataSource={this.state.contests}
                        rowKey="id"
                        onChange={this.sortTable}
                        onRow={(record, rowIndex) => {
                          return {
                            onClick: (e) => {
                              this.showDetail(record)
                            }
                          }
                        }}
                      />
                    ) : null }

                    { this.state.status == 'end' ? (
                      <Table
                        className="ant-table-dark my_contests__table"
                        columns={columns_history}
                        dataSource={this.state.contests}
                        rowKey="id"
                        onChange={this.sortTable}
                        onRow={(record, rowIndex) => {
                          return {
                            onClick: (e) => {
                              this.showDetail(record)
                            }
                          }
                        }}
                      />
                    ) : null }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        { isMobile ? (
          <Drawer
            className="filter-body"
            title="Filter Contests"
            placement="right"
            closable={true}
            onClose={this.closeDrawer}
            visible={this.state.filterDrawer}
            zIndex={9999999}
          >
            <div className="card" style={{marginTop: '10px'}}>
              <div className="card-body">
                <h4 className="title">{this.state.titleWinning}</h4>
                <h4 className="value">{sparlayFund()}{numeral(this.state.winnings).format('0,0[.]00')}</h4>
                <h4 className="title">{this.state.titleContest}</h4>
                <h4 className="value">{this.state.contests.length}</h4>
              </div>
            </div>

            <RadioGroup defaultValue="live" value={this.state.status} size="large" className="my_contests__search__sel" onChange={this.onStatus}>
              <RadioButton value="live" className="my_contests__search__sel__bet">Live</RadioButton>
              <RadioButton value="upcoming" className="my_contests__search__sel__bet">Upcoming</RadioButton>
              <RadioButton value="end" className="my_contests__search__sel__bet">History</RadioButton>
            </RadioGroup>

            <div className="my_contests__search__clear">
              <a onClick={this.clearSearch}>Reset Filters</a>
            </div>
          </Drawer>
        ) : null}


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
                          style={{ width: "180px"}}
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

export default Contest
