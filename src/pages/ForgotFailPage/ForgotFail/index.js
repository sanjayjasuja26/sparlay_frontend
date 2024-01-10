import React from 'react'
import './style.scss'

class ForgotFail extends React.Component {

  render() {

    return (
      <div className="m-fgfail m-fgfail--fullscreen">
        <div className="m-fgfail__header">
          <div className="row">
            <div className="col-lg-12">
              <div className="m-fgfail__header__logo">
                <a >
                  <img src="resources/images/sparlay_logo_text.png" alt="Sparlay" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="m-fgfail__block m-fgfail__block--extended pb-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="m-fgfail__block__inner">
                <div className="m-fgfail__block__form">
                  <br/>
                  <img src="/resources/images/forgot-fail.png" alt="Thumbsup"></img>
                  <br/>
                  <br/>
                  <label>The email address provided doesn't not</label>
                  <label>exist in our system.</label>
                  <label><a href="/forgot-pass">try again</a> or contact <a href="/contact">customer service</a>.
                  </label>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ForgotFail
