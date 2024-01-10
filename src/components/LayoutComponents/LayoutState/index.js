import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setLayoutState, setSports, setPlansPurchase, setPlansUpgrade, setPlansVIP } from 'ducks/app'
import { merge } from 'lodash'
import classNames from 'classnames'
import axios from 'axios'
import qs from 'qs'

const mapStateToProps = (state, props) => ({
  layoutState: state.app.layoutState,
  url: state.app.url,
})


@connect(mapStateToProps)
@withRouter
class LayoutState extends React.PureComponent {

  bootstrapLayoutSettings() {
    const { dispatch } = this.props
    const urlParams = qs.parse(this.props.location.search.replace('?', ''))
    const storageParams = JSON.parse(window.localStorage.getItem('sparlay.layoutState'))
    if (storageParams) {
      delete storageParams.settingsOpened
    }
    const mergedParams = merge({}, storageParams, urlParams)
    const booleanMergedParams = JSON.parse(
      JSON.stringify(mergedParams),
      (key, value) => (value === 'true' ? true : value === 'false' ? false : value),
    )
    dispatch(setLayoutState({ ...booleanMergedParams }))

    let sports = window.localStorage.getItem('sparlay.sports')
    if (sports) {
      dispatch(setSports(JSON.parse(sports)))
      dispatch(setPlansVIP(JSON.parse(window.localStorage.getItem('sparlay.plans_vip'))))
      dispatch(setPlansUpgrade(JSON.parse(window.localStorage.getItem('sparlay.plans_upgrade'))))
      dispatch(setPlansPurchase(JSON.parse(window.localStorage.getItem('sparlay.plans_purchase'))))
    }

    axios({
      method: 'get',
      url: this.props.url + '/setting',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .then((res) => {
      if (res.data.res === 'success') {
        dispatch(setSports(res.data.sports))
        dispatch(setPlansVIP(res.data.plans_vip))
        dispatch(setPlansUpgrade(res.data.plans_upgrade))
        dispatch(setPlansPurchase(res.data.plans_purchase))
      }
    })
    .catch((err) => {
      console.log(err)
    })

    let location = {
      ip: '',
      country: ''
    }
    window.localStorage.setItem('sparlay.location', JSON.stringify(location))
    axios.get('https://geo.ipify.org/api/v1?apiKey=at_FILqEKJCFYgZdgzsk2BB8zHzmNcVQ')
      .then((res) => {
        let r = res.data
        let location = {
          ip: r.ip,
          country: r.location.country,
          region: r.location.region,
          city: r.location.city,
          zip: r.location.postalCode,
          proxy: r.proxy
        }
        // console.log(location)
        window.localStorage.setItem('sparlay.location', JSON.stringify(location))
      })
      .catch((err) => {
        console.log('*** LayoutState/getLocation', err)
      })
  }

  componentWillReceiveProps(newProps) {
    document.body.className = classNames(newProps.layoutState)
  }

  componentWillMount() {
    this.bootstrapLayoutSettings()
  }

  render() {
    return null
  }
}

export default LayoutState
