import test from 'ava'
import CoinFalcon from 'index'
import { checkFields } from './utils'

const client = CoinFalcon()

test('[API] Market list', async t => {
  const res = await client.markets()
  checkFields(t, res[0], ['name'])
})

test('[API] Market list', async t => {
  const res = await client.markets()
  checkFields(t, res[0], ['name'])
})

test('[API] Order Book', async t => {
  const res = await client.orderbook('BTC-EUR')
  checkFields(t, res, ['bids', 'asks'])
})

test('[API] Trade List', async t => {
  const res = await client.tradebook('BTC-EUR')
  checkFields(t, res[0], ['id'])
})

test('[API] privateCall error', async t => {
  try {
    await client.fetchAccountBalances()
  } catch(e) {
    t.is(e.message, 'You need to pass an API key and secret to make authenticated calls.')
  }
})
