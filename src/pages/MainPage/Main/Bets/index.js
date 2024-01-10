import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import qs from 'qs'
import {
  sparlayToken,
  sparlayFund,
  getDateTime,
  renderCurrency,
  cap
} from 'siteGlobal/g'

import Menu from 'antd/lib/menu'

import './style.scss'

const SubMenu = Menu.SubMenu
const Divider = Menu.Divider

const mapStateToProps = ({ app }, props) => {
  const { userState , url } = app
  return {
    userState: userState,
    url: url,
  }
}


@connect(mapStateToProps)
class Bets extends React.Component {

  state = {
    selectedKeys: '',
    openKeys: [''],
    past: [],
    up: [],
    active: [],
    menuData: [],
  }

  getSports = (sport) => {
    let sports = sport.split(', ')
    let result = ''
    for (let s of sports)
      result += cap(s) + ' '

    return result
  }

  getItemData = (bet) => {
    let data = (<div>{renderCurrency(bet.currency, 'a')} {bet.type}, {this.getSports(bet.sport)} {bet.odds}, {getDateTime(bet.utc)}</div>)
    return data
  }


  genPast = (range, past) => {
    let items = []

    if (past.length === 0) {
      items.push({title: 'No past bets', key: 'past-no', des: '1'})
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
        if (range === 'less')
          items.push({title: 'More', key: 'past-more', action: '1'})
        else
          items.push({title: 'Less', key: 'past-less', action: '1'})
      }
    }

    return items
  }

  genUp = (range, up) => {
    let items = []

    if (up.length === 0) {
      items.push({title: 'No upcoming bets', key: 'up-no', des: '1'})
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
        if (range === 'less')
          items.push({title: 'More', key: 'up-more', action: '1'})
        else
          items.push({title: 'Less', key: 'up-less', action: '1'})
      }
    }

    return items
  }

  genActive = (range, active) => {
    var items = []

    if (active.length === 0) {
      items.push({title: 'No active bets', key: 'active-no', des: '1'})
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
        if (range === 'less')
          items.push({title: 'More', key: 'active-more', action: '1'})
        else
          items.push({title: 'Less', key: 'active-less', action: '1'})
      }
    }

    return items
  }


  handleClick = e => {
    var { menuData, past, up, active } = this.state
    var skey = e.key
    if (skey.includes('more')) {
      if (skey.includes('past'))
        menuData[0].children = this.genPast('more', past)
      else if (skey.includes('up'))
        menuData[2].children = this.genUp('more', up)
      else if (skey.includes('active'))
        menuData[4].children = this.genActive('more', active)
    } else if (skey.includes('less')) {
      if (skey.includes('past'))
        menuData[0].children = this.genPast('less', past)
      else if (skey.includes('up'))
        menuData[2].children = this.genUp('less', up)
      else if (skey.includes('active'))
        menuData[4].children = this.genActive('less', active)
    } else if (skey.includes('_')) {
      let ss = skey.split('_')
      let index = parseInt(ss[1], 10)

      if (skey.includes('past'))
        this.props.viewBet(past[index])
      else if (skey.includes('up'))
        this.props.viewBet(up[index])
      else if (skey.includes('active'))
        this.props.viewBet(active[index])
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
      <Divider key={Math.random()} />
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



//******************************* Component ***************************//

  componentDidMount() {
    const _this = this
    axios({
      method: 'post',
      url: this.props.url + '/bet/user_bets',
      headers: {'Content-Type' : 'application/x-www-form-urlencoded'},
      data: qs.stringify({ user_id: this.props.userState.user_id })
    })
      .then((res) => {
        if (res.data.res === 'success'){
          let past = res.data.bets.past, up = res.data.bets.up, active = res.data.bets.active
          let pastItems = [], upItems = [], activeItems = []

          if (past.length === 0)
            pastItems.push({title: 'No past bets', key: 'past-no', des: '1'})
          else
            pastItems = _this.genPast('less', past)

          if (up.length === 0)
            upItems.push({title: 'No upcoming bets', key: 'up-no', des: '1'})
          else
            upItems = _this.genUp('less', up)

          if (active.length === 0)
            activeItems.push({title: 'No active bets', key: 'active-no', des: '1'})
          else
            activeItems = _this.genActive('less', active)

          var menuData = [
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
      .catch((err) => {
        console.log('***Main/Bets : mount',err)
      })
  }


//******************************* Render ******************************//

  render() {
    const { isMobile } = this.props
    const { selectedKeys, openKeys, menuData } = this.state
    const params = { breakpoint: 'lg' }

    return (
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
    )
  }
}

export { Bets }
