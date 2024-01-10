import React from 'react'
import './style.scss'

import Button from 'antd/lib/button'

class Shop extends React.Component {

  render() {
    return (
      <div className="m-shop">
        <div className="row">
          <div className="col-lg-6 swag">
            <img src="/resources/images/swag.png" alt=""/>
          </div>
          <div className="col-lg-6 swag-title">
            <img src="/resources/images/swag-title.png" alt=""/>
            <Button className="y-button">Shop Now</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default Shop
