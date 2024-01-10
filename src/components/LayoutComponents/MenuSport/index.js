import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link, withRouter } from 'react-router-dom'
import { setLayoutState , setSiteState } from 'ducks/app'
import { Scrollbars } from 'react-custom-scrollbars'
import './style.scss'
import { sportImage } from 'siteGlobal/g'


import Menu from 'antd/lib/menu'
import Input from 'antd/lib/input'
const SubMenu = Menu.SubMenu
const Divider = Menu.Divider
const Search = Input.Search



const mapStateToProps = ({ app }) => {
  const { layoutState , sports , url } = app
  return {
    collapsed: layoutState.menuCollapsed,
    theme: layoutState.themeLight ? 'light' : 'dark',
    settingsOpened: layoutState.settingsOpened,
    url: url,
    sports: sports,
  }
}

@connect(mapStateToProps)
@withRouter
class MenuSport extends React.Component {
  state = {
    collapsed: this.props.collapsed,
    theme: this.props.theme,
    settingsOpened: this.props.settingsOpened,

    selectedKeys: '',
    openKeys: [''],
  }

  searchSport = (v, e) => {
    if (v == '') return

    let sv = v.toLowerCase()
    for (let sport of this.props.sports) {
      for (let league of sport.leagues) {
        if (league.title.includes(sv)) {
          const { dispatch } = this.props
          dispatch(setSiteState({
            betLeague: league.league_id,
            betType: '',
            betMatch: '',
            betNum: 0,
          }))
          dispatch(push('/create'))
          dispatch(setLayoutState({ menuMobileOpened: false }))
          return
        }
      }
    }
  }

  handleClick = e => {
    const { dispatch } = this.props
    console.log(e.key)
    dispatch(setSiteState({
      betLeague: e.key,
      betType: '',
      betMatch: '',
      betNum: 0,
    }))
    dispatch(push('/create'))
    dispatch(setLayoutState({ menuMobileOpened: false }))

    this.setState({ selectedKeys: e.key })
  }

  onOpenChange = openKeys => {
    let newKeys = ['']
    if (openKeys.length > 1) {
      newKeys.push(openKeys[openKeys.length - 1])
    }

    this.setState({ openKeys: newKeys })
  }

  menuSports(sports) {
    return sports.map(sport => {
      let subMenuTitle = (
        <span className="menuSport__title-wrap" key={sport.key}>
          <img className="sparlay-sport" alt=""
            style={{marginBottom: '3px', marginLeft: '0px'}}
            src={sportImage(sport.key)} />
          <span className="menuSport__item-title">{sport.title}</span>
        </span>
      )

      if (sport.leagues) {
        return (
          <SubMenu title={subMenuTitle} key={sport.key}>
            {sport.leagues.map(league => {
              return (
                <Menu.Item key={league.league_id}>
                  <span className="menuSport__item-title">{league.title}</span>
                </Menu.Item>
              )
            })}
          </SubMenu>
        )
      } else {
        return null
      }
    })
  }


  render() {
    const { isMobile } = this.props
    const { selectedKeys, theme} = this.state
    const menuItems = this.menuSports(this.props.sports)
    const paramsMobile = { width: 256 }
    const paramsDesktop = {
      width: 256,
      breakpoint: 'lg',
      position: 'fixed'
    }
    const params = isMobile ? paramsMobile : paramsDesktop

    return (
      <div style={params} className="menuSport">
        {/*<div className="menuSport__searchArea">*/}
          {/*<div className="menuSport__search">*/}
            {/*<Search*/}
              {/*className="menuSport__searchInput"*/}
              {/*placeholder="Sports Search"*/}
              {/*onSearch={this.searchSport}*/}
              {/*style={{ width: "100%" , height: "40px" }}*/}
            {/*/>*/}
          {/*</div>*/}
        {/*</div>*/}

        <Scrollbars autoHide style={{ height: isMobile ? 'calc(100vh - 64px)' : 'calc(100vh - 112px)' }}>
          <Menu
            theme={theme}
            onClick={this.handleClick}
            selectedKeys={[selectedKeys]}
            openKeys={this.state.openKeys}
            onOpenChange={this.onOpenChange}
            mode="inline"
            className="menuSport__navigation"
          >
            {menuItems}
          </Menu>
        </Scrollbars>
      </div>
    )
  }
}

export default MenuSport
