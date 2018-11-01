import test from 'ava'
import CoinFalcon from 'index'
import { checkFields } from './utils'

const client = CoinFalcon({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
})

// read-only

test('[API] Account Balances', async t => {
  const res = await client.fetchAccountBalances()
  checkFields(t, res[0], ['id'])
})

test('[API] User Fees', async t => {
  const res = await client.fetchUserFees()
  checkFields(t, res, ['maker_fee', 'taker_fee', 'btc_volume_30d'])
})

test('[API] User Trades', async t => {
  const res = await client.fetchAllTrades('BTC-EUR')
  t.true(Array.isArray(res))
})

test('[API] User Orders', async t => {
  const res = await client.fetchAllOrders('BTC-EUR')
  t.true(Array.isArray(res))
})

test('[API] Get order', async t => {
  try {
    await client.fetchOrder('0')
  } catch(e) {
    t.is(e.message, "Order with id 0 not found.")
  }
})

test('[API] Get order trades', async t => {
  try {
    await client.fetchOrderTrades('0')
  } catch(e) {
    t.is(e.message, "Order with id 0 not found.")
  }
})

test('[API] Get deposits', async t => {
  const res = await client.fetchDeposits()
  t.true(Array.isArray(res))
})

test('[API] Get deposit', async t => {
  try {
    await client.fetchDeposit('0')
  } catch(e) {
    // Can not match message because of I18n
    t.pass()
  }
})

test('[API] Get deposit address', async t => {
  const res = await client.fetchDepositAddress('btc')
  checkFields(t, res, ['address'])
})

test('[API] Get withdrawals', async t => {
  const res = await client.fetchWithdrawals()
  t.true(Array.isArray(res))
})

test('[API] Get withdrawal', async t => {
  try {
    await client.fetchWithdrawal('0')
  } catch(e) {
    // Can not match message because of I18n
    t.pass()
  }
})

// read-write
test('[API] Create Order / invalid operation_type', async t => {
  try {
    await client.createOrder('BTC-EUR', 'stop_loss_order', 'buy', 1)
  } catch(e) {
    t.is(e.message, "Invalid operation_type value, valid values are `market_order` or `limit_order`")
  }
})

test('[API] Create Order / price order_type', async t => {
  try {
    await client.createOrder('BTC-EUR', 'limit_order', 'get', 1)
  } catch(e) {
    t.is(e.message, "Invalid order_type value, valid values are `buy` or `sell`")
  }
})

test('[API] Create Order / price missing', async t => {
  try {
    await client.createOrder('BTC-EUR', 'limit_order', 'buy', 1)
  } catch(e) {
    t.is(e.message, "Method createOrder requires 'price' parameter.")
  }
})

test('[API] Create Order / size + funds', async t => {
  try {
    await client.createOrder('BTC-EUR', 'market_order', 'buy', 1, null, { funds: 1})
  } catch(e) {
    t.is(e.message, "Only specify either `extra_params.funds` or `size` for market order")
  }
})

test('[API] Create Order / neither size nor funds', async t => {
  try {
    await client.createOrder('BTC-EUR', 'market_order', 'buy')
  } catch(e) {
    t.is(e.message, "`extra_params.funds` or `size` is required for market order")
  }
})

test('[API] Create Order / post only market order', async t => {
  try {
    await client.createOrder('BTC-EUR', 'market_order', 'buy', 1, null, {post_only: true}) // eslint-disable-line camelcase
  } catch(e) {
    t.is(e.message, "market order can not be post_only order")
  }
})

test('[API] Create Order / server error', async t => {
  try {
    await client.createOrder('BTC-BTC', 'market_order', 'buy', 1)
  } catch(e) {
    // Can not match message because of I18n
    t.pass()
  }
})

test('[API] Cancel order', async t => {
  try {
    await client.cancelOrder('0')
  } catch(e) {
    // Can not match message because of I18n
    t.pass()
  }
})

test('[API] Create Withdrawal / client error', async t => {
  try {
    await client.createWithdrawal('BTC', 1)
  } catch(e) {
    t.is(e.message, "Method createWithdrawal requires 'address' parameter.")
  }
})

test('[API] Create Withdrawal / server error', async t => {
  try {
    await client.createWithdrawal('abc', 1, 'abc')
  } catch(e) {
    t.pass()
  }
})

test('[API] Cancel Withdrawal', async t => {
  try {
    await client.cancelWithdrawal('0')
  } catch(e) {
    // Can not match message because of I18n
    t.pass()
  }
})

