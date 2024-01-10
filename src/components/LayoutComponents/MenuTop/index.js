import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { reduce } from 'lodash'
import { setLayoutState, setUserState } from 'ducks/app'
import Profile from './Profile'
import Token from './Token'
import { default as menuData } from 'siteGlobal/data_menu'
import './style.scss'
import axios from 'axios'
import qs from 'qs'

import Menu from 'antd/lib/menu'
import Drawer from 'antd/lib/drawer'
 
const SubMenu = Menu.SubMenu
const Divider = Menu.Divider

const mapStateToProps = ({ app}) => {
  const { layoutState, dialogState, userState, url } = app

  return {
    url: url,
    userState: userState,
    pathname: window.location.pathname,
    collapsed: layoutState.menuCollapsed,
    theme: 'dark',
    loginPrompt: dialogState.loginPrompt,
  }
}

@connect(mapStateToProps)
@withRouter
class MenuTop extends React.Component {
  state = {
    pathname: this.props.pathname,
    collapsed: this.props.collapsed,
    theme: 'dark',
    selectedKeys: '',
    openKeys: [''],
    drawer: false,
  }

//******************************* Actions *****************************//

  handleClick = e => {
    const { dispatch, isMobile } = this.props
    if (isMobile) {
      // collapse menu on isMobile state
      dispatch(setLayoutState({ menuMobileOpened: false }))
    }
    
    // set current selected keys
    if (e.key.includes('export')) {
      switch (e.key) {
        case 'export_shark':
          window.open('https://www.oddsshark.com/sports-betting', '_blank')
          break
        case 'export_insights':
          window.open('https://www.sportsinsights.com', '_blank')
          break
        case 'export_covers':
          window.open('https://www.covers.com', '_blank')
          break
        case 'export_vegas':
          window.open('http://www.vegasinsider.com', '_blank')
          break
        case 'export_sbs':
          window.open('https://www.sportsbettingstats.com', '_blank')
          break
        case 'export_action':
          window.open('https://www.actionnetwork.com', '_blank')
          break
        case 'export_pros':
          window.open('https://www.bettingpros.com', '_blank')
          break
        case 'export_vsin':
          window.open('https://www.vsin.com', '_blank')
          break
        default:
          break
      }
    }else{
      this.setState({
        selectedKeys: e.key,
        openKeys: e.keyPath,
        drawer: false,
      })      
    }
  }

  onOpenChange = openKeys => {
    this.setState({
      openKeys,
    })
  }

  onMain = e => {
    
    this.setState({
      selectedKeys: '',
      openKeys: [''],
    })
  }

  getPath(data, id, parents = []) {
    const { selectedKeys } = this.state
    let items = reduce(
      data,
      (result, entry) => {
        if (result.length) {
          return result
        } else if (entry.url === id && selectedKeys === '') {
          return [entry].concat(parents)
        } else if (entry.key === id && selectedKeys !== '') {
          return [entry].concat(parents)
        } else if (entry.children) {
          let nested = this.getPath(entry.children, id, [entry].concat(parents))
          return nested ? nested : result
        }
        return result
      },
      [],
    )
    return items.length > 0 ? items : false
  }

  getActiveMenuItem = (props, items) => {
    const { selectedKeys, pathname } = this.state
    let { collapsed } = props
    let [activeMenuItem, ...path] = this.getPath(items, !selectedKeys ? pathname : selectedKeys)
    this.setState({
      selectedKeys: activeMenuItem ? activeMenuItem.key : '',
      collapsed,
    })
  }

  generateMenuPartitions(items) {
    return items.map(menuItem => {
      if (menuItem.children) {
        let subMenuTitle = (
          <span className="menuTop__title-wrap" key={menuItem.key}>
            <span className="menuTop__item-title">{menuItem.title}</span>
            {menuItem.icon && <span className={menuItem.icon + ' menuTop__icon'} />}
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
    ) : item.url ? (
      <Menu.Item key={key} disabled={disabled}>
        <Link
          to={url}
          onClick={
            this.props.isMobile
              ? () => {
                  dispatch(setLayoutState({ menuCollapsed: false }))
                }
              : undefined
          }
        >
          <span className="menuTop__item-title">{title}</span>
          {icon && <span className={icon + ' menuTop__icon'} />}
        </Link>
      </Menu.Item>
    ) : (
      <Menu.Item key={key} disabled={disabled}>
        <span className="menuTop__item-title">{title}</span>
        {icon && <span className={icon + ' menuTop__icon'} />}
      </Menu.Item>
    )
  }


  checkBalance = () => {
    var { dispatch, userState } = this.props
    if (userState.user_id === '') return

    axios({
      method: 'post',
      url: this.props.url + '/auth/get_balance',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: qs.stringify({user_id: userState.user_id})
    })
      .then(function (res) {
        if (res.data.res === 'success'){
          userState.cash = res.data.balance.cash
          userState.token = res.data.balance.token
          dispatch(setUserState({ userState: userState }))
        } else {
          console.log("***/MenuTop: checkBalance >", res.data.err)
        }
      })
      .catch(function (error) {
        console.log("***/MenuTop: checkBalance >", error)
      })
  }

  componentDidMount() {
    setInterval(this.checkBalance, 50000)
  }

  componentWillMount() {
    this.getActiveMenuItem(this.props, menuData)
  }

  componentWillReceiveProps(newProps) {
    let path = newProps.pathname.split('/')[1]
    if (path === 'main'){
      path = ''
    }

    if (this.state.selectedKeys !== 'path') {
      this.setState({
        selectedKeys: path,
        openKeys: [path],
      })
    }

    this.setState(
      {
        pathname: newProps.pathname,
        theme: newProps.theme,
      },
      () => {
        if (!newProps.isMobile) {
          this.getActiveMenuItem(newProps, menuData)
        }
      },
    )
  }

//******************************* Drawer ******************************//

  showDrawer = () => {
    this.setState({
      drawer: true
    })
  }

  closeDrawer = () => {
    this.setState({
      drawer: false
    }) 
  }

//******************************* Render ******************************//

  render() {
    const { selectedKeys, openKeys, theme } = this.state
    const { isMobile } = this.props
    const menuItems = this.generateMenuPartitions(menuData)
    return (
      <div className="menuTop">
        <div className="menuTop__left">
          <div className={ isMobile ? "menuTop__logo__mobile" : "menuTop__logo"}>
            <div className="menuTop__logoContainer">
              <Link to="/" onClick={this.onMain}>
                <img src="resources/images/sparlay_logo_text.png" alt="" />
              </Link>
            </div>
          </div>
          { isMobile ? null : (
            <Menu
              theme={theme}
              onClick={this.handleClick}
              selectedKeys={[selectedKeys]}
              openKeys={openKeys}
              onOpenChange={this.onOpenChange}
              mode="horizontal"
              className="menuTop__navigation"
            >
              {menuItems}
            </Menu>
          ) }
        </div>
        <div className="menuTop__right">
          <Profile isMobile={isMobile} />
          <Token isMobile={isMobile} />
          {isMobile ? (
            <a onClick={this.showDrawer}><i className="menu-m fa fa-bars"/></a>
          ) : null }
        </div>

        <Drawer
          className="menuMobile"
          placement="left"
          closable={false}
          onClose={this.closeDrawer}
          visible={this.state.drawer}
          zIndex={9000000}
        >
          <Menu
              theme={theme}
              onClick={this.handleClick}
              selectedKeys={[selectedKeys]}
              openKeys={openKeys}
              onOpenChange={this.onOpenChange}
              className="menuTop__navigation"
            >
              {menuItems}
            </Menu>
        </Drawer> 
      </div>
    )
  }
}

export default MenuTop
