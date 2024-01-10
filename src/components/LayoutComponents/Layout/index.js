import React from 'react'
import PropTypes from 'prop-types'
import { Spinner } from 'react-redux-spinner'
import Routes from 'routes'
import Footer from 'components/LayoutComponents/Footer'
import FooterSwag from 'components/LayoutComponents/FooterSwag'
import MenuTop from 'components/LayoutComponents/MenuTop'
import MenuLeft from 'components/LayoutComponents/MenuLeft'
import MenuSwag from 'components/LayoutComponents/MenuSwag'
import Content from 'components/LayoutComponents/Content'
import Loader from 'components/LayoutComponents/Loader'
import LayoutState from 'components/LayoutComponents/LayoutState'
import Dialog from 'components/LayoutComponents/Dialog'
import { enquireScreen, unenquireScreen } from 'enquire-js'
import { ContainerQuery } from 'react-container-query'
import classNames from 'classnames'
import './style.scss'

import BackTop from 'antd/lib/back-top'
import AntLayout from 'antd/lib/layout'
const AntContent = AntLayout.Content
const AntFooter = AntLayout.Footer

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
}

var isMobile
enquireScreen(b => {
  isMobile = b
})

var contentBuffer = {
  pathName: null,
  content: null,
}

class Layout extends React.Component {
  static childContextTypes = {
    getContentBuffer: PropTypes.func,
    setContentBuffer: PropTypes.func,
  }

  state = {
    isMobile,
    isShop: false,
  }

  getChildContext() {
    return {
      getContentBuffer: () => contentBuffer,
      setContentBuffer: ({ pathName, content }) => (contentBuffer = { pathName, content }),
    }
  }


  componentDidMount() {
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      })
    })
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler)
  }

  setLayout() {
    var w = window.location.href.split('/')
    if(w.indexOf('shop') > 0 && this.state.isShop === false) {
      this.setState({
        isShop: true,
      })
    }else if (w.indexOf('shop') < 0 && this.state.isShop === true){
      this.setState({
        isShop: false,
      })
    }
  }

  render() {
    const isMobile = this.state.isMobile
    this.setLayout()
    return (
      <ContainerQuery query={query}>
        {params => (
          <div className={classNames(params)}>
            <AntLayout>
              <LayoutState />
              <Loader />
              <Spinner />
              <BackTop />
              <Routes />
              <MenuTop isMobile={isMobile} />
              { this.state.isShop ? (
                <div>
                  <MenuSwag isMobile={isMobile} />
                  <AntLayout className="m-content m-content-shop">
                    <AntContent style={{ height: '100%' }}>
                      <Content />
                    </AntContent>
                    <FooterSwag />
                  </AntLayout>
                </div>
              ) : (
                <div>
                  <MenuLeft isMobile={isMobile} />
                  <AntLayout className={isMobile ? "m-content m-content-mobile" : "m-content m-content-noshop"}>
                    <AntContent style={{ height: '100%' }}>
                      <Content />
                    </AntContent>
                    <AntFooter>
                      <Footer />
                    </AntFooter>
                  </AntLayout>
                </div>
              )}
              <Dialog isMobile={isMobile}/>
            </AntLayout>
          </div>
        )}
      </ContainerQuery>
    )
  }
}

export default Layout
