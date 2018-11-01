import test from 'ava'
import CoinFalcon from 'index'

const client = CoinFalcon({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
})

test('[WS] account balances', async t => {
  const clean = await client.ws.accountBalances(() => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})

test('[WS] user orders', async t => {
  const clean = await client.ws.userOrders('BTC-USDT', () => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})

test('[WS] user trades', async t => {
  const clean = await client.ws.userTrades('BTC-USDT', () => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})
