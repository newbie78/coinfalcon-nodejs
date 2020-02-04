'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var baseUrl = 'wss://ws.coinfalcon.com';

/**
 * Finalize WebSocket response
 */
var sendResult = function sendResult(cb, msg) {
  var identifier = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var data = JSON.parse(msg);
  if (data.identifier && data.message) {
    return cb(_extends({}, identifier, data.message));
  }
};

/**
 * Setup websocket with open
 */
var setup = function setup(w, identifier, cb) {
  w.onopen = function () {
    return w.send(JSON.stringify({ "command": "subscribe", "identifier": JSON.stringify(identifier) }));
  };
  w.onmessage = function (msg) {
    return sendResult(cb, msg.data, identifier);
  };
  return function () {
    return w.close(1000, 'Close handle was called');
  };
};

/**
 * Public websocket
 */
var publicSocket = function publicSocket() {
  return new _ws2.default(baseUrl);
};

/**
 * Private websocket connection with auth details
 */
var privateSocket = function privateSocket(_ref) {
  var apiKey = _ref.apiKey,
      apiSecret = _ref.apiSecret;
  return function (fn, params) {
    if (!apiKey || !apiSecret) {
      throw new Error('You need to pass an API key and secret to connect to user data stream.');
    }

    var w = new _ws2.default(baseUrl, undefined, { headers: (0, _utils.sign)(apiKey, apiSecret, '/auth/feed', 'GET') });
    return fn.apply(undefined, [w].concat(_toConsumableArray(params)));
  };
};

/**
 * Public WebSockets
 */

// Get orderbook
var orderbook = function orderbook(market, cb) {
  var w = publicSocket();
  var identifier = { "channel": "OrderbookChannel", market: market };
  return setup(w, identifier, cb);
};

// Get trades
var tradebook = function tradebook(market, cb) {
  var w = publicSocket();
  var identifier = { "channel": "TradesChannel", market: market };
  return setup(w, identifier, cb);
};

// Get ticker for market
var ticker = function ticker(market, cb) {
  var w = publicSocket();
  var identifier = { "channel": "TickerChannel", market: market };
  return setup(w, identifier, cb);
};

/**
 * Private WebSockets
 */

// Get user trades
var _userTrades = function _userTrades(w, market, cb) {
  var identifier = { "channel": "UserTradesChannel", market: market };
  return setup(w, identifier, cb);
};

// Get user orders
var _userOrders = function _userOrders(w, market, cb) {
  var identifier = { "channel": "UserOrdersChannel", market: market };
  return setup(w, identifier, cb);
};

// Get user balances
var _accountBalances = function _accountBalances(w, cb) {
  var identifier = { "channel": "AccountChannel" };
  return setup(w, identifier, cb);
};

exports.default = function (opts) {
  var pSocket = privateSocket(opts);

  return {
    // public
    orderbook: orderbook,
    tradebook: tradebook,
    ticker: ticker,

    // private
    userTrades: function userTrades(market, cb) {
      return pSocket(_userTrades, [market, cb]);
    },
    userOrders: function userOrders(market, cb) {
      return pSocket(_userOrders, [market, cb]);
    },
    accountBalances: function accountBalances(cb) {
      return pSocket(_accountBalances, [cb]);
    }
  };
};