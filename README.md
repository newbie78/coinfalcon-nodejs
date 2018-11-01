# coinfalcon-nodejs [![Build Status](https://travis-ci.org/coinfalcon-github/coinfalcon-nodejs.svg?branch=master)](https://travis-ci.org/coinfalcon-github/coinfalcon-nodejs) [![Coverage Status](https://coveralls.io/repos/github/coinfalcon-github/coinfalcon-nodejs/badge.svg)](https://coveralls.io/github/coinfalcon-github/coinfalcon-nodejs)

Note: This wrapper uses Promises, if they are not supported in your environment, you might
want to add [a polyfill](https://github.com/stefanpenner/es6-promise) for them.

### Installation

    yarn add coinfalcon-nodejs

or

    npm install coinfalcon-nodejs

### Getting started

Import the module and create a new client. Passing api keys is optional only if
you don't plan on doing authenticated calls. You can create an api key
[here](https://coinfalcon.com/settings/api-access).

```js
import CoinFalcon from 'coinfalcon-nodejs'

const client = CoinFalcon()

// Authenticated client, can make signed calls
const client2 = CoinFalcon({
  apiKey: '...',
  apiSecret: '...',
})

client.markets().then(data => console.log(data))
```

If you do not have an appropriate babel config, you will need to use the basic commonjs requires.

```js
const CoinFalcon = require('coinfalcon-nodejs').default
```

Every API call returns a Promise, making this library [async await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) ready.
Following examples will use the `await` form, which requires some configuration you will have to lookup.

### Table of Contents

- [Public API Calls](#public-api-calls)
  - [markets](#markets)
  - [orderbook](#orderbook)
  - [tradebook](#tradebook)
- [Authenticated API Calls](#authenticated-api-calls)
  - [fetchAccountBalances](#fetchaccountbalances)
  - [fetchUserFees](#fetchuserfees)
  - [fetchAllTrades](#fetchalltrades)
  - [fetchAllOrders](#fetchallorders)
  - [fetchOrder](#fetchorder)
  - [createOrder](#createorder)
  - [cancelOrder](#cancelorder)
  - [fetchDeposits](#fetchdeposits)
  - [fetchDeposit](#fetchdeposit)
  - [fetchDepositAddress](#fetchdepositaddress)
  - [fetchWithdrawals](#fetchwithdrawals)
  - [fetchWithdrawal](#fetchwithdrawal)
  - [createWithdrawal](#createwithdrawal)
  - [cancelWithdrawal](#cancelwithdrawal)
- [Public Websockets](#public-websockets)
  - [ticker](#ticker)
  - [orderbook](#orderbook-1)
  - [tradebook](#tradebook-1)
- [Authenticated Websockets](#authenticated-websockets)
  - [accountBalances](#accountbalances)
  - [userTrades](#usertrades)
  - [userOrders](#userorders)

### Public API Calls

#### markets

Get data for all open markets

```js
// definition: markets()
console.log(await client.markets())
```

<details>
<summary>Output</summary>

```js
[
  {
    "name": "IOT-BTC",
    "precision": 8,
    "min_volume": "0.00000001",
    "min_price": "0.00000001",
    "volume": "0.07844506",
    "last_price": "0.00007221",
    "change_in_24h": "-0.37",
    "size_precision": 8,
    "price_precision": 8
  },
  {
    "name": "ETH-BTC",
    "precision": 6,
    "min_volume": "0.00000001",
    "min_price": "0.000001",
    "volume": "0.821696",
    "last_price": "0.031064",
    "change_in_24h": "-1.7",
    "size_precision": 8,
    "price_precision": 6
  },
  ...
]
```

</details>

#### orderbook

Get a list of open orders for a market. The amount of detail shown can be customized with the level parameter.

```js
// definition: orderbook(market, level)
console.log(await client.orderbook('BTC-USDT', 1))
```

Parameter | Default | Description
--------- | ------- | -----------
market | required | Get only orders from specific market e.g. `BTC-USDT`
level | 1 | Defines the level of the request

Level | Description
--------- | -------
1 | Only the best bid and ask
2 | Top 50 bids and asks
3 | Full order book


<details>
<summary>Output</summary>

```js
{
  "bids": [
    {
      "price": "6225.0",
      "size": "0.01"
    },
    {
      "price": "6220.14",
      "size": "1.31"
    },
    ...
  ],
  "asks": [
    {
      "price": "6400.0",
      "size": "0.38493686"
    },
    {
      "price": "6400.07",
      "size": "0.0303693"
    },
    ...
  ]
}
```

</details>

#### tradebook

List the latest trades for a market.

```js
// definition: tradebook(market, since_time, start_time, end_time)
console.log(await client.tradebook('ETH-BTC'))
```

Parameter | Default | Description
--------- | ------- | -----------
market | required | Get only orders from specific market e.g. `ETH-BTC`
since_time | optional | Returns orders since the given datetime
start_time | optional | Returns orders beginning with the given datetime
end_time | optional | Returns orders ending with the given datetime

<details>
<summary>Output</summary>

```js
[
  {
    "id": "13f33ced-0652-4f30-a11b-d380844c50b2",
    "price": "0.066",
    "size": "0.01",
    "market_name": "ETH-BTC",
    "side": "buy",
    "created_at": "2018-04-06T10:14:33.009320Z"
  },
  {
    "id": "f46248d9-326f-405d-bfca-508e949116ad",
    "price": "0.066",
    "size": "0.01",
    "market_name": "ETH-BTC",
    "side": "buy",
    "created_at": "2018-04-06T10:13:57.709221Z"
  },
  ...
]
```

</details>

### Authenticated API Calls

#### fetchAccountBalances

Get your account balances

```js
// definition: fetchAccountBalances()
console.log(await client.fetchAccountBalances())
```

<details>
<summary>Output</summary>

```js
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "balance": "0.0",
    "available_balance": "0.0",
    "hold_balance": "0.0",
    "currency_code": "usdt",
    "currency_name": "TetherUS"
  },
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "balance": "0.0",
    "available_balance": "0.0",
    "hold_balance": "0.0",
    "currency_code": "btc",
    "currency_name": "Bitcoin"
  },
  ...
]
```

</details>

#### fetchUserFees

Get fees for taker & maker order along with your 30 days trading volume

```js
// definition: fetchUserFees()
console.log(await client.fetchUserFees())
```

<details>
<summary>Output</summary>

```js
{
  "maker_fee": "0.0",
  "taker_fee": "0.25",
  "btc_volume_30d": "0.0"
}
```

</details>

#### fetchAllTrades

Get your trades for market

```js
// definition fetchAllTrades(market, since_time, start_time, end_time)
console.log(await client.fetchAllTrades('BTC-EUR'))
```

Parameter | Default | Description
--------- | ------- | -----------
market     | required | Get only trades from specific market e.g. `BTC-EUR`
since_time | optional | Returns trades since the given datetime
start_time | optional | Returns trades beginning with the given datetime
end_time   | optional | Returns trades ending with the given datetime

<details>
<summary>Output</summary>

```js
[
  {
    "id": "74fcd4e5-a472-4482-92cf-70be8c44bda4",
    "price": "7541.6",
    "size": "0.00091",
    "market_name": "BTC-EUR",
    "order_id": "97aa8719-4e69-422f-86f8-7485170f0055",
    "side": "sell",
    "fee": "0.0",
    "liquidity": "M",
    "created_at": "2018-04-24T13:46:04.597195Z"
  },
  ...
]
```

</details>

#### fetchAllOrders

Get your orders for market

```js
// definition fetchAllOrders(market, status, since_time, start_time, end_time)
console.log(await client.fetchAllOrders('BTC-USDT'))
```

Parameter | Default | Description
--------- | ------- | -----------
market | required | Get only orders from specific market e.g. `BTC-EUR`
status | optional | Use `all` to get all types of statuses
since_time | optional | Returns orders since the given datetime
start_time | optional | Returns orders beginning with the given datetime
end_time | optional | Returns orders ending with the given datetime

(Note: If status is not specified, all pending, open & partial orders will be returned)

<details>
<summary>Output</summary>

```js
[
  {
    "id": "a7ed361d-bf39-4b70-a456-e18eadc1b494",
    "market_name": "BTC-EUR",
    "price": "6420.0",
    "size": "0.1",
    "size_filled": "0.1",
    "fee": "0.00025",
    "funds": "642.0",
    "status": "fulfilled",
    "order_type": "buy",
    "post_only": false,
    "operation_type": "market_order",
    "created_at": "2017-11-06T09:54:42.723945Z"
  },
  {
    "id": "de45bc37-7440-40a3-b5ba-a08dc463e387",
    "market_name": "BTC-EUR",
    "price": "6419.0",
    "size": "0.1",
    "size_filled": "0.1",
    "fee": "0.00025",
    "funds": "641.9",
    "status": "fulfilled",
    "order_type": "buy",
    "post_only": false,
    "operation_type": "market_order",
    "created_at": "2017-11-06T09:53:08.383210Z"
  }
]
```

</details>

#### fetchOrder

Get order by id

```js
// definition: fetchOrder(id)
console.log(await client.fetchOrder('a7ed361d-bf39-4b70-a456-e18eadc1b494'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | Order id

<details>
<summary>Output</summary>

```js
{
  "id": "a7ed361d-bf39-4b70-a456-e18eadc1b494",
  "market": "BTC-EUR",
  "price": "7263.0",
  "size": "0.01",
  "size_filled": "0.0",
  "fee": "0.0",
  "funds": "0.01",
  "status": "canceled",
  "order_type": "sell",
  "post_only": false,
  "operation_type": "limit_order",
  "created_at": "2018-02-04T05:07:59.801504Z"
}
```

</details>

#### createOrder

Place an order

```js
// definition: createOrder(market, operation_type, order_type, size, price, extra_params)
console.log(await client.createOrder('ETH-BTC', 'limit_order', 'buy', 1, 0.03993, { post_only: true }))
```

Parameter | Default | Description
--------- | ------- | -----------
market | required | Create order for specific market e.g. `BTC-EUR`
operation_type | required | `market_order` or `limit_order`
order_type | required | `buy` or `sell` left currency of market
size | required | Amount of currency to buy or sell
price | required | Set the price for `limit_order`

Extra paramas is an object which can have following attributes

Extra Parameter | Description
--------- | -----------
post_only | `true` or `false`
funds     | how much amount to spend in right currency for `market_order`

(Note: `size` & `price` both are required for `limit_order`. As for `market_order`, either `size` or `extra_params.funds` is required, but not both.)

<details>
<summary>Output</summary>

```js
{
  "id": "4cc9835d-3aad-4e3b-aa76-538e6f18247a",
  "market": "ETH-BTC",
  "price": "0.03993",
  "size": "1.0",
  "size_filled": "0.0",
  "fee": "0.0",
  "funds": "0.03993",
  "status": "pending",
  "order_type": "buy",
  "post_only": true,
  "operation_type": "limit_order",
  "created_at": "2017-11-03T08:46:14.354945Z"
}
```

</details>

#### cancelOrder

Cancel open order

```js
// definition: cancelOrder(id)
console.log(await client.cancelOrder('a7ed361d-bf39-4b70-a456-e18eadc1b494'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | Order id

<details>
<summary>Output</summary>

```js
{
  "id": "a7ed361d-bf39-4b70-a456-e18eadc1b494",
  "market": "BTC-EUR",
  "price": "7263.0",
  "size": "0.01",
  "size_filled": "0.0",
  "fee": "0.0",
  "funds": "0.01",
  "status": "canceled",
  "order_type": "sell",
  "post_only": false,
  "operation_type": "limit_order",
  "created_at": "2018-02-04T05:07:59.801504Z"
}
```

</details>

#### fetchOrderTrades

Get trades for particular order id

```js
// definition: fetchOrderTrades(id)
console.log(await client.fetchOrderTrades('97aa8719-4e69-422f-86f8-7485170f0055'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | Order id

<details>
<summary>Output</summary>

```js
[
  {
    "id": "74fcd4e5-a472-4482-92cf-70be8c44bda4",
    "price": "7541.6",
    "size": "0.00091",
    "market_name": "BTC-EUR",
    "order_id": "97aa8719-4e69-422f-86f8-7485170f0055",
    "side": "sell",
    "fee": "0.0",
    "liquidity": "M",
    "created_at": "2018-04-24T13:46:04.597195Z"
  },
  {
    "id": "a7ed361d-bf39-4b70-a456-e18eadc1b494",
    "price": "7541.7",
    "size": "0.00096",
    "market_name": "BTC-EUR",
    "order_id": "97aa8719-4e69-422f-86f8-7485170f0055",
    "side": "sell",
    "fee": "0.0",
    "liquidity": "M",
    "created_at": "2018-04-24T13:46:09.597195Z"
  }
]
```

</details>

#### fetchDeposits

Get deposit history

```js
// definition: fetchDeposits(currency, status, since_time, start_time, end_time)
console.log(await client.fetchDeposits('btc'))
```

Parameter | Default | Description
--------- | ------- | -----------
currency | optional | currency code e.g. `btc`
status | optional | [pending, completed]
since_time | optional | Returns deposits since the given datetime
start_time | optional | Returns deposits beginning with the given datetime
end_time | optional | Returns deposits ending with the given datetime

<details>
<summary>Output</summary>

```js
[
  {
    "id": "030c7377-32e5-4078-a1ca-18322250bfd5",
    "amount": "0.01",
    "status": "completed",
    "currency_code": "btc",
    "txid": "3caa72cc139505f7e20f17f825c323c6e5888553098df2efe296362d79b7dcd8",
    "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
    "type": "deposit"
  },
  {
    "id": "2ee9a009-4c3c-4942-a73b-bbe893199beb",
    "amount": "0.01",
    "status": "completed",
    "currency_code": "btc",
    "txid": "6f230aa0493b46d54ab82125ff50ff77bde419c0986660dc175060e367ca0a5a",
    "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
    "type": "deposit"
  }
]
```

</details>

#### fetchDeposit

Get deposit details

```js
// definition: fetchDeposit(id)
console.log(await client.fetchDeposit('e30a3ac8-33b1-46ed-8f54-1112417de581'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | deposit id

<details>
<summary>Output</summary>

```js
{
  "id": "e30a3ac8-33b1-46ed-8f54-1112417de581",
  "amount": "0.01",
  "status": "completed",
  "currency_code": "btc",
  "txid": "782c9be82488e791a93facf7dff2809a8e32e8ec02ee723f0da7d4f72558d82e",
  "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
  "type": "deposit"
}
```

</details>

#### fetchDepositAddress

Get deposit address for currency

```js
// definition: fetchDepositAddress(currency)
console.log(await client.fetchDepositAddress('xrp'))
```

Parameter | Default | Description
--------- | ------- | -----------
currency | required | currency code e.g. `btc`

(Note: deposit tag will also be returned along with address if required)

<details>
<summary>Output</summary>

```js
{
  "address": "r3qasmoPKKpoH3b3zWWq6R2V849bPDZosJ",
  "tag": "2575700108"
}
```

</details>

#### fetchWithdrawals

Get withdrawal history

```js
// definition: fetchWithdrawals(currency, status, since_time, start_time, end_time)
console.log(await client.fetchWithdrawals('btc'))
```

Parameter | Default | Description
--------- | ------- | -----------
currency | optional | currency code e.g. `btc`
status | optional | [pending, completed] |
since_time | optional | Returns deposits since the given datetime
start_time | optional | Returns deposits beginning with the given datetime
end_time | optional | Returns deposits ending with the given datetime

<details>
<summary>Output</summary>

```js
[
  {
    "id": "4f408bea-abf0-46f7-9ae3-c19edbbd38e9",
    "amount": "1.0",
    "status": "completed",
    "fee": "0.000441",
    "currency_code": "btc",
    "txid": "15d0ea80886ed8518373475bd621db5a04d05645bad13bf785b3032830cdb5f5",
    "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
    "type": "withdraw"
  },
  {
    "id": "7db1dd7e-bcdd-4b6d-b31c-3699d1ef4a95",
    "amount": "0.01",
    "status": "completed",
    "fee": "0.000441",
    "currency_code": "btc",
    "txid": "5c569352ae4d55c5f31a4087329bf4e38d57129f8522dd0e6ecccda355bbd570",
    "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
    "type": "withdraw"
  }
]
```

</details>

#### fetchWithdrawal

Get Withdrawal Detail

```js
// definition: fetchWithdrawal(id)
console.log(await client.fetchWithdrawal('9b25877a-35ae-4812-8d89-953ed4c55094'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | withdrawal id

<details>
<summary>Output</summary>

```js
{
  "id": "9b25877a-35ae-4812-8d89-953ed4c55094",
  "amount": "0.01",
  "status": "completed",
  "fee": "0.00000662",
  "currency_code": "btc",
  "txid": "af88900ee9b99b468bf3159be757d6d1be6ef4c2e0fb993e80acb8a2b733742d",
  "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
  "type": "withdraw"
}
```

</details>

#### createWithdrawal

Create a withdrawal

```js
// definition: createWithdrawal(currency, amount, address, tag)
console.log(await client.createWithdrawal('btc', 0.001, '2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6'))
```

Parameter | Default | Description
--------- | ------- | -----------
currency | required | currency code like `btc`
address | required | withdraw address
amount | required | withdraw amount
tag | optional | withdraw tag for currencies like XRP

<details>
<summary>Output</summary>

```js
{
  "id": "641e12db-699e-410e-8b3d-6fff4669119c",
  "amount": "0.001",
  "status": "pending",
  "fee": "0.000441",
  "currency_code": "btc",
  "txid": "nil",
  "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
  "type": "withdraw"
}
```

</details>

#### cancelWithdrawal

Cancel a withdrawal

```js
// definition: cancelWithdrawal(id)
console.log(await client.cancelWithdrawal('8b591a8a-6c4f-4ab6-bef4-f156c0311346'))
```

Parameter | Default | Description
--------- | ------- | -----------
id | required | withdrawal id

<details>
<summary>Output</summary>

```js
{
  "id": "8b591a8a-6c4f-4ab6-bef4-f156c0311346",
  "amount": "0.001",
  "status": "canceled",
  "fee": "0.000441",
  "currency_code": "btc",
  "txid": null,
  "address": "2NBoxXmc9E8Fa6TPfFLip6ifDUMcB3Nwsc6",
  "type": "withdraw"
}
```

</details>

### Public Websockets

Every websocket utility returns a function you can call to close the opened connection and avoid memory issues. See the ticker example for how to use it.

#### ticker

Provides real-time price updates every time a match happens.

```
// definition: ws.ticker(market, callback)
const close = client.ws.ticker('BTC-EUR', function(data) { console.log(data) })

// After you're done
close()
```

<details>
<summary>Message</summary>

```js
{
  "channel": "TickerChannel",
  "market": "BTC-EUR",
  "market_info": {
    "id": 9,
    "d1_btc_volume": "2.16905549",
    "d1_price_volume": "12137.875346739",
    "d1_volume": "2.16905549",
    "latest_trade_price": "6499.94",
    "middle_price": "5567.905",
    "percent_change_24h": "17.010621062106210621",
    "right_currency_sign": "€",
    "price_precision": 2,
    "size_precision": 8
  }
}
```

</details>

#### orderbook

Provides real-time updates on orders

```
// definition: ws.orderbook(market, callback)
client.ws.orderbook('ETH-BTC', function(data) { console.log(data) })
```

Upon successful connection, the websocket will send the snapshot of the existing book

<details>
<summary>Snapshot Message</summary>

```js
{
  "channel": "OrderbookChannel",
  "market": "ETH-BTC",
  "init": {
    "bids": [
        {"price": "0.075", "size": "1.56307"},
        {"price": "0.07491", "size": "0.011"},
        {"price": "0.0747", "size": "1.0"},
        ...
    ],
    "asks": [
        {"price": "0.08975", "size": "0.98998"},
        {"price": "0.0899", "size": "0.5"},
        {"price": "0.0913", "size": "0.19231"},
        ...
    ],
    "price_precision": 5,
    "size_precision": 5
  }
}
```

</details>


After this, the connection will send the updates which are to be applied on the existing orderbook

<details>
<summary>Update Message</summary>

```js
{
  "channel": "OrderbookChannel",
  "market": "ETH-BTC",
  "update": {
    "key": "asks",
    "value": [
      {
        "price": "0.00022168",
        "size": "447.66944"
      }
    ]
  }
}
```

</details>

#### tradebook

Provides real-time updates on trades

```
// definition: ws.tradebook(market, callback)
client.ws.tradebook('LTC-BTC', function(data) { console.log(data) })
```

Upon successful connection, the websocket will send the snapshot of the recent trades

<details>
<summary>Snapshot Message</summary>

```js
{
  "channel": "TradesChannel",
  "market": "LTC-BTC",
  "init": {
    "trades": [
      {
        "id": "8b591a8a-6c4f-4ab6-bef4-f156c0311346",
        "price": "0.02384",
        "size": "0.112",
        "market_name": "LTC-BTC",
        "side": "buy",
        "created_at": "2018-04-24T11:40:01.876812Z"
      },
      {
        "id": "641e12db-699e-410e-8b3d-6fff4669119c",
        "price": "0.02390",
        "size": "0.231",
        "market_name": "LTC-BTC",
        "side": "buy",
        "created_at": "2018-04-24T11:41:05.986121Z"
      },
      ...
    ]
  }
}
```

</details>


After this, the connection will send the new trades one by one as it happens

<details>
<summary>New Trade Message</summary>

```js
{
  "channel": "TradesChannel",
  "market": "LTC-BTC",
  "trade": {
    "id": "d40d9f77-dbf3-4ffe-ba97-65eeacc8ebc7",
    "price": "0.02394",
    "size": "0.31",
    "market_name": "LTC-BTC",
    "side": "buy",
    "created_at": "2018-04-24T13:46:05.121966Z"
  }
}
```

</details>

### Authenticated Websockets

#### accountBalances

Get live data of account balance updates

```js
// definition: ws.accountBalances(callback)
client.ws.accountBalances(function(data) { console.log(data) })
```

Upon successful connection, the websocket will send the snapshot of all account balances

<details>
<summary>Snapshot Message</summary>

```js
{
  channel: 'AccountChannel',
  balances: [
    {
      id: '1eb8c31f-a617-483e-ac3c-ad1260952cee',
      balance: '0.45',
      available_balance: '0.0',
      hold_balance: '0.45',
      usable_balance: '0.0000776024',
      currency_code: 'eur',
      currency_name: 'Euro'
    },
    {
      id: 'cbdbd292-9620-4452-9c5b-617e907a71bb',
      balance: '0.0',
      available_balance: '0.0',
      hold_balance: '0.0',
      usable_balance: '0.0',
      currency_code: 'btc',
      currency_name: 'Bitcoin'
    },
    ...
  ]
}
```

</details>


After this, the connection will send the balance update for individual account in real-time

<details>
<summary>Update Message</summary>

```js
{
  channel: 'AccountChannel',
  balances: [
    {
      available_balance: '0.45',
      balance: '0.45',
      currency_code: 'eur',
      currency_name: 'Euro',
      hold_balance: '0.0',
      id: '1eb8c31f-a617-483e-ac3c-ad1260952cee',
      usable_balance: '0.4571813374'
    }
  ]
}
```

</details>

#### userTrades

Provides real-time updates for your trades for a market

```js
// definition: ws.userTrades(market, callback)
client.ws.userTrades('BTC-EUR', function(data) { console.log(data) })
```

Upon successful connection, the websocket will send the snapshot of previous trades

<details>
<summary>Snapshot Message</summary>

```js
{
  channel: 'UserTradesChannel',
  market: 'BTC-EUR',
  init: {
    trades: [
      {
        id: 'd3670f95-c186-40fd-9f8c-57bce8c73730',
        price: '5660.0',
        size: '0.00106008',
        market_name: 'BTC-EUR',
        order_id: 'b5f569a4-dde1-41f2-bdd6-558248a53549',
        fee: '0.0',
        liquidity: 'M',
        created_at: '2018-10-27T07:15:03.784327Z',
        order_type: 'buy',
        volume: '0.00106008',
        left_currency_code: 'BTC',
        right_currency_code: 'EUR'
      },
      ...
    ]
  }
}
```

</details>


After this, the connection will send the balance update for new trades as they execute

<details>
<summary>Update Message</summary>

```js
{
  channel: 'UserTradesChannel',
  market: 'BTC-EUR',
  trade: {
    id: '1eb8c31f-a617-483e-ac3c-ad1260952cee',
    price: '5660.0',
    size: '0.001',
    market_name: 'BTC-EUR',
    order_id: 'b5f569a4-dde1-41f2-bdd6-558248a53549',
    fee: '0.0',
    liquidity: 'M',
    created_at: '2018-10-27T07:15:12.241298Z',
    order_type: 'buy',
    volume: '0.001',
    left_currency_code: 'BTC',
    right_currency_code: 'EUR'
  }
}
```

</details>


#### userOrders

Provides real-time updates for your orders for a market

```js
// definition: ws.userOrders(market, callback)
client.ws.userOrders('IOT-EUR', function(data) { console.log(data) })
```

Upon successful connection, the websocket will send the snapshot of existing open orders

<details>
<summary>Snapshot Message</summary>

```js
{
  channel: 'UserOrdersChannel',
  market: 'IOT-EUR',
  init: {
    open_orders: [
      {
        id: '6f6ae92b-71ef-4b11-b931-db8608fbcab7',
        market: 'IOT-EUR',
        price: '0.3',
        size: '1.52367',
        size_filled: '0.0',
        fee: '0.0',
        funds: '0.457101',
        status: 'open',
        order_type: 'buy',
        post_only: false,
        operation_type: 'limit_order',
        created_at: '2018-10-31T10:02:02.332206Z'
      },
      ...
    ]
  }
}
```

</details>


After this, the connection will send the updates for individual orders whenever there is an update e.g. status change, change in filled size etc.

<details>
<summary>Update Message</summary>

```js
{
  channel: 'UserOrdersChannel',
  market: 'IOT-EUR',
  order:{
    created_at: '2018-10-31T10:02:02.332206Z',
    fee: '0.0',
    funds: '0.457101',
    id: '6f6ae92b-71ef-4b11-b931-db8608fbcab7',
    market: 'IOT-EUR',
    operation_type: 'limit_order',
    order_type: 'buy',
    post_only: false,
    price: '0.3',
    size: '1.52367',
    size_filled: '0.0',
    status: 'canceled'
  }
}
```

</details>
