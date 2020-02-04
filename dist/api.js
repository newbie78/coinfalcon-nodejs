'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var baseUrl = 'https://coinfalcon.com/api';

/**
 * Finalize API response
 */
var sendResult = function sendResult(call) {
  return call.then(function (res) {
    var validStatus = res.status >= 200 && res.status < 300;
    var json = res.data;
    if (!validStatus || json.error) {
      var error = new Error(json.error || res.status + ' ' + res.statusText);
      error.code = res.status;
      throw error;
    }

    return json.data;
  });
};

/**
 * Util to validate existence of required parameter(s)
 */
var checkParams = function checkParams(name, payload) {
  var requires = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  requires.forEach(function (r) {
    if (!payload || !payload[r]) {
      throw new Error('Method ' + name + ' requires \'' + r + '\' parameter.');
    }
  });

  return true;
};

/**
 * Stringify all object key values
 */
var stringifyObject = function stringifyObject(obj) {
  var newObj = {};
  Object.keys(obj).map(function (k) {
    return [null, undefined].indexOf(obj[k]) === -1 ? newObj[k] = obj[k].toString() : '';
  });
  return newObj;
};

/**
 * Make public calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
var publicCall = function publicCall(path, data) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
  var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return sendResult((0, _axios2.default)({
    url: baseUrl + '/' + path + (0, _utils.makeQueryString)(data),
    method: method,
    responseType: 'json',
    headers: headers,
    validateStatus: function validateStatus() {
      return true;
    }
  }));
};

/**
 * Factory method for private calls against the api
 *
 * @param {string} path Endpoint path
 * @param {object} data The payload to be sent
 * @param {string} method HTTB VERB, GET by default
 * @param {object} headers
 * @returns {object} The api response
 */
var privateCall = function privateCall(_ref) {
  var apiKey = _ref.apiKey,
      apiSecret = _ref.apiSecret;
  return function (path) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
    var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!apiKey || !apiSecret) {
      throw new Error('You need to pass an API key and secret to make authenticated calls.');
    }

    return sendResult((0, _axios2.default)({
      url: baseUrl + '/' + path + (method === 'GET' ? (0, _utils.makeQueryString)(data) : ''),
      method: method,
      headers: _extends({}, headers, (0, _utils.sign)(apiKey, apiSecret, path, method, data)),
      json: true,
      data: method !== 'GET' ? data : {},
      validateStatus: function validateStatus() {
        return true;
      }
    }));
  };
};

var _createOrder = function _createOrder(pCall, payload, extraParams) {
  // eslint-disable-line camelcase
  checkParams('createOrder', payload, ['market', 'operation_type', 'order_type']);

  payload.operation_type = payload.operation_type.toLowerCase(); // eslint-disable-line camelcase

  if (['market_order', 'limit_order'].indexOf(payload.operation_type) === -1) {
    throw new Error('Invalid operation_type value, valid values are `market_order` or `limit_order`');
  }

  payload.order_type = payload.order_type.toLowerCase(); // eslint-disable-line camelcase
  if (['buy', 'sell'].indexOf(payload.order_type) === -1) {
    throw new Error('Invalid order_type value, valid values are `buy` or `sell`');
  }

  if (payload.operation_type === 'limit_order') {
    checkParams('createOrder', payload, ['size', 'price']);
  } else if (payload.size && extraParams.funds) {
    throw new Error('Only specify either `extra_params.funds` or `size` for market order');
  } else if (!payload.size && !extraParams.funds) {
    throw new Error('`extra_params.funds` or `size` is required for market order');
  } else if (extraParams.post_only) {
    throw new Error('market order can not be post_only order');
  }

  var data = _extends({}, stringifyObject(payload), stringifyObject(extraParams));

  return pCall('v1/user/orders', data, 'POST');
};

var _createWithdrawal = function _createWithdrawal(pCall, payload) {
  checkParams('createWithdrawal', payload, ['currency', 'amount', 'address']);
  return pCall('v1/account/withdraw', stringifyObject(payload), 'POST');
};

exports.default = function (opts) {
  var pCall = privateCall(opts);

  return {
    // public calls
    markets: function markets() {
      return publicCall('v1/markets');
    },
    orderbook: function orderbook(market) {
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return publicCall('v1/markets/' + market + '/orders', { level: level });
    },
    tradebook: function tradebook(market) {
      var since_time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var start_time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var end_time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return publicCall('v1/markets/' + market + '/trades', { since_time: since_time, start_time: start_time, end_time: end_time });
    }, // eslint-disable-line camelcase

    // private calls

    // read-only
    fetchAccountBalances: function fetchAccountBalances() {
      return pCall('v1/user/accounts');
    },
    fetchUserFees: function fetchUserFees() {
      return pCall('v1/user/fees');
    },
    fetchAllTrades: function fetchAllTrades(market) {
      var since_time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var start_time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var end_time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return pCall('v1/user/trades', { market: market, since_time: since_time, start_time: start_time, end_time: end_time });
    }, // eslint-disable-line camelcase
    fetchAllOrders: function fetchAllOrders(market) {
      var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var since_time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var start_time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var end_time = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      return pCall('v1/user/orders', { market: market, status: status, since_time: since_time, start_time: start_time, end_time: end_time });
    }, // eslint-disable-line camelcase
    fetchOrder: function fetchOrder(id) {
      return pCall('v1/user/orders/' + id);
    },
    fetchOrderTrades: function fetchOrderTrades(id) {
      return pCall('v1/user/orders/' + id + '/trades');
    },
    fetchDeposits: function fetchDeposits() {
      var currency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var since_time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var start_time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var end_time = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      return pCall('v1/account/deposits', { currency: currency, status: status, since_time: since_time, start_time: start_time, end_time: end_time });
    }, // eslint-disable-line camelcase
    fetchDeposit: function fetchDeposit(id) {
      return pCall('v1/account/deposit/' + id);
    },
    fetchDepositAddress: function fetchDepositAddress(currency) {
      return pCall('v1/account/deposit_address', { currency: currency });
    },
    fetchWithdrawals: function fetchWithdrawals() {
      var currency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var since_time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var start_time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var end_time = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      return pCall('v1/account/withdrawals', { currency: currency, status: status, since_time: since_time, start_time: start_time, end_time: end_time });
    }, // eslint-disable-line camelcase
    fetchWithdrawal: function fetchWithdrawal(id) {
      return pCall('v1/account/withdrawal', { id: id });
    },

    // read-write
    createOrder: function createOrder(market, operation_type, order_type, size) {
      var price = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var extra_params = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      return _createOrder(pCall, { market: market, operation_type: operation_type, order_type: order_type, size: size, price: price }, extra_params);
    }, // eslint-disable-line camelcase,max-params
    cancelOrder: function cancelOrder(id) {
      return pCall('v1/user/orders/' + id, {}, 'DELETE');
    },
    createWithdrawal: function createWithdrawal(currency, amount, address) {
      var tag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return _createWithdrawal(pCall, { currency: currency, amount: amount, address: address, tag: tag });
    },
    cancelWithdrawal: function cancelWithdrawal(id) {
      return pCall('v1/account/withdrawals/' + id, {}, 'DELETE');
    }
  };
};