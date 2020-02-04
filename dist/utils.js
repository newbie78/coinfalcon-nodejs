'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sign = exports.makeQueryString = undefined;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Build query string for uri encoded url based on json object
 */
var makeQueryString = exports.makeQueryString = function makeQueryString(q) {
  return q ? '?' + Object.keys(q).map(function (k) {
    return q[k] ? encodeURIComponent(k) + '=' + encodeURIComponent(q[k]) : '';
  }).join('&') : '';
};

/**
 * Sign the request using key & secret
 */
var sign = exports.sign = function sign(apiKey, apiSecret, path, method, data) {
  if (!data) data = {};
  var timestamp = Math.round(new Date().getTime() / 1000).toString();
  var endpoint = path !== '/auth/feed' ? '/api/' + path : path;
  if (method === 'GET' && data && Object.keys(data).length) {
    endpoint += makeQueryString(data);
  }

  var payload = [timestamp, method.toUpperCase(), endpoint].join('|');
  if (method !== 'GET') {
    payload = payload + '|' + JSON.stringify(data);
  }

  var signature = _crypto2.default.createHmac('sha256', apiSecret).update(payload).digest('hex');

  return {
    'CF-API-KEY': apiKey,
    'CF-API-TIMESTAMP': timestamp,
    'CF-API-SIGNATURE': signature
  };
};