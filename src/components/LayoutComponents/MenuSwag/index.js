import React from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { reduce } from 'lodash'
import { setLayoutState } from 'ducks/app'
import { default as menuData } from './menuData'
import './style.scss'

import Menu from 'antd/lib/menu'
const SubMenu = Menu.SubMenu
const Divider = Menu.Divider

const mapStateToProps = ({ app }) => {
  const { layoutState } = app
  return {
    pathname: window.location.pathname,
    collapsed: layoutState.menuCollapsed,
    theme: 'dark',
  }
}

@connect(mapStateToProps)
@withRouter
class MenuSwag extends React.Component {
  state = {
    pathname: this.props.pathname,
    collapsed: this.props.collapsed,
    theme: 'dark',
    selectedKeys: '',
    openKeys: [''],
  }

  handleClick = e => {
    this.setState({
      selectedKeys: e.key,
      openKeys: e.keyPath,
    })
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
          <span className="menuSwag__title-wrap" key={menuItem.key}>
            <span className="menuSwag__item-title">{menuItem.title}</span>
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
          <span className="menuSwag__item-title">{title}</span>
          {icon && <span className={icon + ' menuSwag__icon'} />}
        </Link>
      </Menu.Item>
    ) : (
      <Menu.Item key={key} disabled={disabled}>
        <span className="menuSwag__item-title">{title}</span>
        {icon && <span className={icon + ' menuSwag__icon'} />}
      </Menu.Item>
    )
  }

  componentWillMount() {
    this.getActiveMenuItem(this.props, menuData)
  }

  componentWillReceiveProps(newProps) {
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

  render() {
    // const { selectedKeys, openKeys, theme } = this.state
    const menuItems = this.generateMenuPartitions(menuData)
    return null
  }
}

export default MenuSwag
