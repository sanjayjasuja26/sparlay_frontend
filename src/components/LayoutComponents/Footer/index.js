import React from 'react'
import './style.scss'

class AppFooter extends React.Component {
  render() {
    return (
      <div className="footer">
        <div className="footer__top">
          <div className="row">
            <div className="col-lg-8">
              <p>
                <strong>It pays to play with Sparlay!</strong>
              </p>
              <p>
                Sparlay, patent-pending, is the first ever peer-to-peer sports betting platform.
              </p>
            </div>
            <div className="col-lg-4">
              <div className="footer__copyright">
                <img src="resources/images/favicon.png" alt="" />
                <span>
                  © 2021 playsparlay.com All rights reserved.
                  <br />
                  <a href="/terms">Terms of Service</a>
                  <br />
                  <a href="/privacy">Privacy Policy</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default AppFooter
