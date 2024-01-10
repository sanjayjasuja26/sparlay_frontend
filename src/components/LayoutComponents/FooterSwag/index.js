import React from 'react'
import './style.scss'

import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
const InputGroup = Input.Group

class FooterSwag extends React.Component {

  onSubscribe = () => {
    var email = document.getElementById("subscribe-email").value
    console.log(email)
  }

  render() {
    return (
      <div className="footer-swag">
        <div className="row">
        <div className="col-lg-6">
          <InputGroup compact className="subscribe-group pull-left">
            <Input size="large" id="subscribe-email" className="subscribe-email" type="email"
            placeholder="Your Email" />
            <Button className="y-button" style={{height: '40px', width: '100px'}}
            onClick={this.onSubscribe}
            >
              Subscribe
            </Button>
          </InputGroup>
        </div>
        <div className="col-lg-6">
          <div className="icon-area pull-right">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/twitter_b.png" alt=""/>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/instergram_b.png" alt=""/>              
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img className="link-icon" src="resources/images/facebook_b.png" alt=""/>
            </a>
          </div>
        </div>
        </div>
      </div>
    )
  }
}

export default FooterSwag
