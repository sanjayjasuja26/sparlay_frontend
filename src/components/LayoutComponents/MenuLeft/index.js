import 'rc-drawer/assets/index.css'
import React from 'react'
import DrawerMenu from 'rc-drawer'
import { connect } from 'react-redux'
import MenuSport from 'components/LayoutComponents/MenuSport'
import { setLayoutState } from 'ducks/app'
import './style.scss'

const mapStateToProps = ({ app }, props) => ({
  open: app.layoutState.menuMobileOpened,
})

@connect(mapStateToProps)
class MenuLeft extends React.Component {
  state = {
    open: this.props.open,
  }

  toggleOpen = () => {
    const { dispatch } = this.props
    const { open } = this.state
    dispatch(setLayoutState({ menuMobileOpened: !open }))
  }

  componentWillReceiveProps({ open }) {
    this.setState({
      open,
    })
  }

  render() {
    const { isMobile } = this.props
    const { open } = this.state
    return isMobile ? (
      <DrawerMenu
        getContainer={null}
        level={null}
        open={open}
        onMaskClick={this.toggleOpen}
        onHandleClick={this.toggleOpen}
      >
        <MenuSport {...this.props} />
      </DrawerMenu>
    ) :  (
      <MenuSport {...this.props} />
    )
  }
}

export default MenuLeft
