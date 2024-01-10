import { createAction, createReducer } from 'redux-act'
import { push } from 'react-router-redux'
import { pendingTask, begin, end } from 'react-redux-spinner'

const REDUCER = 'sparlay'
const NS = `@@${REDUCER}/`
const _setLoading = createAction(`${NS}SET_LOADING`)
const _setHideLogin = createAction(`${NS}SET_HIDE_LOGIN`)

export const setSports = createAction(`${NS}SET_SPORT`)
export const setPlansVIP = createAction(`${NS}SET_PLANS_VIP`)
export const setPlansUpgrade = createAction(`${NS}SET_PLANS_UPRADE`)
export const setPlansPurchase = createAction(`${NS}SET_PLANS_PURCHASE`)
export const setUserPayments = createAction(`${NS}SET_USER_PAYMENT`)

export const setSiteState = createAction(`${NS}SET_SITE_STATE`)
export const setUserState = createAction(`${NS}SET_USER_STATE`)
export const setLayoutState = createAction(`${NS}SET_LAYOUT_STATE`)
export const setDialogState = createAction(`${NS}SET_DIALOG_STATE`)

export const setUpdatingContent = createAction(`${NS}SET_UPDATING_CONTENT`)

export const setLoading = isLoading => {
  const action = _setLoading(isLoading)
  action[pendingTask] = isLoading ? begin : end
  return action
}

export const resetHideLogin = () => (dispatch, getState) => {
  const state = getState()
  if (state.pendingTasks === 0 && state.app.isHideLogin) {
    dispatch(_setHideLogin(false))
  }
  return Promise.resolve()
}

export const initAuth = roles => (dispatch, getState) => {

  dispatch(push('/main'))
  return Promise.reject()
}

const initialState = {

  //************** App State **************//

  from: '',
  isUpdatingContent: false,
  isLoading: false,
  activeDialog: '',
  dialogForms: {},
  submitForms: {},
  isHideLogin: false,

  url: "https://playsparlay.com:9058",

  sports: [''],
  plans_vip: [],
  plans_upgrade: [],
  plans_purchase: [],
  user_payments: [],


  //************** Layout State **************//

  layoutState: {
    isMenuTop: false,
    menuMobileOpened: false,
    menuCollapsed: false,
    menuShadow: false,
    themeLight: false,
    squaredBorders: false,
    borderLess: false,
    fixedWidth: false,
    settingsOpened: false,
    isMobile: false,
  },


  //************** User State **************//

  userState: {
    user_id: '',
    username: '',
    email: '',
    cash: '0',
    token: '0',
    vip: '1',
    lim: '1',
    upgrade_key: 'no',
    tirl: '0',
    status: ''
  },


  //************** Site State **************//

  siteState: {
    betSport: '',
    betLeague: '',
    betMatch: {},
    betType: '',
    betNum: 0,

    referral: '',

    store: {
      page: '',
      data: {}
    }
  },


  //************** Dialog State **************//

  dialogState: {
    loginPrompt: false,
    cashPrompt: false,
    tokenPrompt: false,
    tokenContestPrompt: false,
    membershipPrompt: false,
    limitPrompt: false,
    blockPrompt: false,
    suspendPrompt: false,
    pendingPrompt: false,
    locationPrompt: false,
    loading: false,
    loadingText: '',

    login: false,
    join: false,
    joinInput: false,
    add_addr: false,
    verify: false,
    upgradeVIP: false,

    selectMethod: false,
    selectPayment: false,
    addCard: false,
    addPaypal: false,

    subscribePlan: 0,
    paymentFlow: 'join',
    paymentAmount: 0,
    paymentToken: 0,

    upgradeKey: '',
    upgradePlan: 0,

    viewStraight: false,
    viewParlay: false,
    bet: {},
    msg: '',
  },
}

export default createReducer(
  {
    [_setLoading]: (state, isLoading) => ({ ...state, isLoading }),
    [_setHideLogin]: (state, isHideLogin) => ({ ...state, isHideLogin }),
    [setUpdatingContent]: (state, isUpdatingContent) => ({ ...state, isUpdatingContent }),

    [setSports]: (state, sports ) => {
      const result = { ...state, sports }
      window.localStorage.setItem('sparlay.sports', JSON.stringify(sports))
      return result
    },
    [setPlansVIP]: (state, plans_vip ) => {
      const result = { ...state, plans_vip }
      window.localStorage.setItem('sparlay.plans_vip', JSON.stringify(plans_vip))
      return result
    },
    [setPlansUpgrade]: (state, plans_upgrade ) => {
      const result = { ...state, plans_upgrade }
      window.localStorage.setItem('sparlay.plans_upgrade', JSON.stringify(plans_upgrade))
      return result
    },
    [setPlansPurchase]: (state, plans_purchase ) => {
      const result = { ...state, plans_purchase }
      window.localStorage.setItem('sparlay.plans_purchase', JSON.stringify(plans_purchase))
      return result
    },
    [setUserPayments]: (state, user_payments ) => {
      const result = { ...state, user_payments }
      return result
    },

    [setUserState]: (state, { userState }) => {
      const result = { ...state, userState }
      window.localStorage.setItem('sparlay.userData', JSON.stringify(userState))
      return result
    },
    [setSiteState]: (state, param) => {
      const siteState = { ...state.siteState, ...param }
      const newState = { ...state, siteState }
      return newState
    },
    [setDialogState]: (state, param) => {
      const dialogState = { ...state.dialogState, ...param }
      const newState = { ...state, dialogState }
      return newState
    },
    [setLayoutState]: (state, param) => {
      const layoutState = { ...state.layoutState, ...param }
      const newState = { ...state, layoutState }
      window.localStorage.setItem('sparlay.layoutState', JSON.stringify(newState.layoutState))
      return newState
    },
  },
  initialState,
)
