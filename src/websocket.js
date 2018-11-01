import { sign } from 'utils'
import WebSocket from 'ws'

const baseUrl = 'wss://ws.coinfalcon.com'

/**
 * Finalize WebSocket response
 */
const sendResult = (cb, msg, identifier = {}) => {
  const data = JSON.parse(msg)
  if (data.identifier && data.message) {
    return cb({ ...identifier, ...data.message })
  }
}

/**
 * Setup websocket with open
 */
const setup = (w, identifier, cb) => {
  w.onopen = () => w.send(JSON.stringify({ "command": "subscribe", "identifier": JSON.stringify(identifier)}))
  w.onmessage = (msg) => sendResult(cb, msg.data, identifier)
  return () => w.close(1000, 'Close handle was called')
}

/**
 * Public websocket
 */
const publicSocket = () =>
  new WebSocket(baseUrl)

/**
 * Private websocket connection with auth details
 */
const privateSocket = ({ apiKey, apiSecret }) => (
  fn,
  params
) => {
  if (!apiKey || !apiSecret) {
    throw new Error('You need to pass an API key and secret to connect to user data stream.')
  }

  const w = new WebSocket(baseUrl, undefined, { headers: sign(apiKey, apiSecret, '/auth/feed', 'GET') })
  return fn(w, ...params)
}

/**
 * Public WebSockets
 */

// Get orderbook
const orderbook = (market, cb) => {
  const w = publicSocket()
  const identifier = {"channel": "OrderbookChannel", market }
  return setup(w, identifier, cb)
}

// Get trades
const tradebook = (market, cb) => {
  const w = publicSocket()
  const identifier = {"channel": "TradesChannel", market }
  return setup(w, identifier, cb)
}

// Get ticker for market
const ticker = (market, cb) => {
  const w = publicSocket()
  const identifier = {"channel": "TickerChannel", market }
  return setup(w, identifier, cb)
}

/**
 * Private WebSockets
 */

// Get user trades
const userTrades = (w, market, cb) => {
  const identifier = {"channel": "UserTradesChannel", market }
  return setup(w, identifier, cb)
}

// Get user orders
const userOrders = (w, market, cb) => {
  const identifier = {"channel": "UserOrdersChannel", market }
  return setup(w, identifier, cb)
}

// Get user balances
const accountBalances = (w, cb) => {
  const identifier = {"channel": "AccountChannel" }
  return setup(w, identifier, cb)
}

export default opts => {
  const pSocket = privateSocket(opts)

  return {
    // public
    orderbook,
    tradebook,
    ticker,

    // private
    userTrades: (market, cb) => pSocket(userTrades, [ market, cb ]),
    userOrders: (market, cb) => pSocket(userOrders, [ market, cb ]),
    accountBalances: (cb) => pSocket(accountBalances, [ cb ])
  }
}
