import axios from 'axios'
import { makeQueryString, sign } from 'utils'

const baseUrl = 'https://coinfalcon.com/api'

/**
 * Finalize API response
 */
const sendResult = call =>
  call.then(res => {
    const validStatus = res.status >= 200 && res.status < 300
    const json = res.data
    if (!validStatus || json.error) {
      const error = new Error(json.error || `${res.status} ${res.statusText}`)
      error.code = res.status
      throw error
    }

    return json.data
  })

/**
 * Util to validate existence of required parameter(s)
 */
const checkParams = (name, payload, requires = []) => {
  requires.forEach(r => {
    if (!payload || !payload[r]) {
      throw new Error(`Method ${name} requires '${r}' parameter.`)
    }
  })

  return true
}

/**
 * Stringify all object key values
 */
const stringifyObject = (obj) => {
  const newObj = {}
  Object.keys(obj).map(k => [null, undefined].indexOf(obj[k]) === -1 ? newObj[k] = obj[k].toString() : '')
  return newObj
}

/**
 * Make public calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
const publicCall = (path, data, method = 'GET', headers = {}) =>
  sendResult(
    axios({
      url: `${baseUrl}/${path}${makeQueryString(data)}`,
      method,
      responseType: 'json',
      headers,
      validateStatus: () => true
    }),
  )

/**
 * Factory method for private calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
const privateCall = ({ apiKey, apiSecret }) => (
  path,
  data = {},
  method = 'GET',
  headers = {},
) => {
  if (!apiKey || !apiSecret) {
    throw new Error('You need to pass an API key and secret to make authenticated calls.')
  }

  return sendResult(
    axios({
      url: `${baseUrl}/${path}${method === 'GET' ? makeQueryString(data) : ''}`,
      method,
      headers: { ...headers, ...sign(apiKey, apiSecret, path, method, data) },
      json: true,
      data: method !== 'GET' ? data : {},
      validateStatus: () => true
    }),
  )
}

const createOrder = (pCall, payload, extraParams) => { // eslint-disable-line camelcase
  checkParams('createOrder', payload, ['market', 'operation_type', 'order_type'])

  payload.operation_type = payload.operation_type.toLowerCase() // eslint-disable-line camelcase

  if (['market_order', 'limit_order'].indexOf(payload.operation_type) === -1) {
    throw new Error('Invalid operation_type value, valid values are `market_order` or `limit_order`')
  }

  payload.order_type = payload.order_type.toLowerCase() // eslint-disable-line camelcase
  if (['buy', 'sell'].indexOf(payload.order_type) === -1) {
    throw new Error('Invalid order_type value, valid values are `buy` or `sell`')
  }

  if (payload.operation_type === 'limit_order') {
    checkParams('createOrder', payload, ['size', 'price'])
  } else if (payload.size && extraParams.funds) {
    throw new Error('Only specify either `extra_params.funds` or `size` for market order')
  } else if (!payload.size && !extraParams.funds) {
    throw new Error('`extra_params.funds` or `size` is required for market order')
  } else if (extraParams.post_only) {
    throw new Error('market order can not be post_only order')
  }

  const data = { ...stringifyObject(payload), ...stringifyObject(extraParams) }

  return pCall('v1/user/orders', data, 'POST')
}

const createWithdrawal = (pCall, payload) => {
  checkParams('createWithdrawal', payload, ['currency', 'amount', 'address'])
  return pCall('v1/account/withdraw', stringifyObject(payload), 'POST')
}

export default opts => {
  const pCall = privateCall(opts)

  return {
    // public calls
    markets: () => publicCall('v1/markets'),
    orderbook: (market, level = 1) => publicCall(`v1/markets/${market}/orders`, { level }),
    tradebook: (market, since_time = null, start_time = null, end_time = null) => publicCall(`v1/markets/${market}/trades`, {since_time, start_time, end_time}), // eslint-disable-line camelcase

    // private calls

    // read-only
    fetchAccountBalances: () => pCall('v1/user/accounts'),
    fetchUserFees: () => pCall('v1/user/fees'),
    fetchAllTrades: (market, since_time = null, start_time = null, end_time = null) => pCall('v1/user/trades', {market, since_time, start_time, end_time}), // eslint-disable-line camelcase
    fetchAllOrders: (market, status = null, since_time = null, start_time = null, end_time = null) => pCall('v1/user/orders', {market, status, since_time, start_time, end_time}), // eslint-disable-line camelcase
    fetchOrder: (id) => pCall(`v1/user/orders/${id}`),
    fetchOrderTrades: (id) => pCall(`v1/user/orders/${id}/trades`),
    fetchDeposits: (currency = null, status = null, since_time = null, start_time = null, end_time = null) => pCall('v1/account/deposits', {currency, status, since_time, start_time, end_time}), // eslint-disable-line camelcase
    fetchDeposit: (id) => pCall(`v1/account/deposit/${id}`),
    fetchDepositAddress: (currency) => pCall('v1/account/deposit_address', {currency}),
    fetchWithdrawals: (currency = null, status = null, since_time = null, start_time = null, end_time = null) => pCall('v1/account/withdrawals', {currency, status, since_time, start_time, end_time}), // eslint-disable-line camelcase
    fetchWithdrawal: (id) => pCall('v1/account/withdrawal', {id}),

    // read-write
    createOrder: (market, operation_type, order_type, size, price = null, extra_params = {}) => createOrder(pCall, {market, operation_type, order_type, size, price}, extra_params), // eslint-disable-line camelcase,max-params
    cancelOrder: (id) => pCall(`v1/user/orders/${id}`, {}, 'DELETE'),
    createWithdrawal: (currency, amount, address, tag = null) => createWithdrawal(pCall, {currency, amount, address, tag}),
    cancelWithdrawal: (id) => pCall(`v1/account/withdrawals/${id}`, {}, 'DELETE'),
  }
}
