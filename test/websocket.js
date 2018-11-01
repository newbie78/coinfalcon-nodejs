import test from 'ava'
import CoinFalcon from 'index'

const client = CoinFalcon()

test('[WS] orderbook', async t => {
  const clean = await client.ws.orderbook('BTC-USDT', () => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})

test('[WS] tradebook', async t => {
  const clean = await client.ws.tradebook('BTC-USDT', () => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})

test('[WS] ticker', async t => {
  const clean = await client.ws.ticker('BTC-USDT', () => {}) // eslint-disable-line no-empty-function
  t.truthy(clean)
  t.true(typeof clean === 'function')
})

test('[WS] private socket error', async t => {
  try {
    await client.ws.accountBalances(() => {}) // eslint-disable-line no-empty-function
  } catch(e) {
    t.is(e.message, 'You need to pass an API key and secret to connect to user data stream.')
  }
})
