import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'
import { setDialogState, setUserState , setSiteState, setUserPayments } from 'ducks/app'

import Menu from 'antd/lib/menu'
import Dropdown from 'antd/lib/dropdown'

const mapStateToProps = ({ app }) => {
  const { userState, dialogState } = app
  return {
    user_id: userState.user_id,
    username: userState.username,
    dialogState: dialogState,
  }
}

@connect(mapStateToProps)
class Profile extends React.Component {

  logout = () => {
    const { dispatch } = this.props
    dispatch(push('/main'))

    const userData = {
      user_id: '',
      email: '',
      firstname: '',
      lastname: '',
      username: '',
      cash: '0',
      token: '0.00',
      vip: '1',
      lim: '1',
    }
    window.localStorage.setItem('sparlay.userData', JSON.stringify(userData))
    dispatch(setUserState({ userState: userData }))
    dispatch(setSiteState({referral: ''}))
    dispatch(setUserPayments([]))
  }

  login = () => {
    const { dispatch } = this.props
    dispatch(setDialogState({ login: true }))
  }

  join = () => {
    const { dispatch } = this.props
    dispatch(setDialogState({ join: true, upgrade: false }))
    dispatch(push('/open'))
  }


  //*************************** render **************************//

  render() {
    const { isMobile } = this.props
    const menu = (
      <Menu selectable={false}>
        <Menu.Item>
          <Link to={"/account"}>
            <i className="menuTop__dropdownMenuIcon fa fa-user" style={{paddingLeft: '3px'}}/> My Account
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/uplimit">
            <i className="menuTop__dropdownMenuIcon fa fa-upload" style={{paddingLeft: '1px'}} /> Upgrade Limit
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/deposit">
            <i className="menuTop__dropdownMenuIcon fa fa-money" /> Deposit Funds
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/purchase">
            <i className="menuTop__dropdownMenuIcon fa fa-money" /> Purchase Tokens
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/withdraw">
            <i className="menuTop__dropdownMenuIcon fa fa-credit-card-alt" /> Withdraw
          </Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item>
          <a href="" onClick={this.logout}>
            <i className="menuTop__dropdownMenuIcon icmn-exit" style={{paddingLeft: '1px'}} /> Logout
          </a>
        </Menu.Item>
      </Menu>
    )

    return (
      <div className={ isMobile ? "menuTop__dropdown-m menuTop__dropdown d-inline-block" : "menuTop__dropdown d-inline-block" }>
        { this.props.user_id === '' ? (
          <div>
            <a className={ isMobile ? "join_button join_button-m" : "join_button" } onClick={this.join}>
              Join
            </a>
            <a className={ isMobile ? "login_button login_button-m" : "login_button" } onClick={this.login}>
              <span className="menuTop__item-title">Login</span>
            </a>
          </div>
        ) : (
          <div>
            { isMobile ? (
              <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomLeft"
                onVisibleChange={this.addCount}
              >
                <a className="dropdown-link-m" >
                  <i className="fa fa-user-o" />
                </a>
              </Dropdown>
            ) : (
              <Dropdown
                overlay={menu}
                trigger={['click']}
                placement="bottomRight"
                onVisibleChange={this.addCount}
              >
                <a className="ant-dropdown-link" >
                  <span className="menuTop__item-title">{this.props.username}</span>
                </a>
              </Dropdown>
            )}
          </div>
        ) }
      </div>
    )
  }
}

export default Profile
