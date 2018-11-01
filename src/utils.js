import crypto from 'crypto'

/**
 * Build query string for uri encoded url based on json object
 */
export const makeQueryString = q =>
  q
    ? `?${Object.keys(q)
        .map(k => q[k] ? `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}` : '')
        .join('&')}`
    : ''

/**
 * Sign the request using key & secret
 */
export const sign = (apiKey, apiSecret, path, method, data) => {
  if(!data) data = {}
  const timestamp = Math.round((new Date()).getTime() / 1000).toString()
  let endpoint = path !== '/auth/feed' ? `/api/${path}` : path
  if (method === 'GET' && data && Object.keys(data).length) {
    endpoint += makeQueryString(data)
  }

  let payload = [ timestamp, method.toUpperCase(), endpoint ].join('|')
  if (method !== 'GET') {
    payload = `${payload}|${JSON.stringify(data)}`
  }

  const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex')

  return {
    'CF-API-KEY': apiKey,
    'CF-API-TIMESTAMP': timestamp,
    'CF-API-SIGNATURE': signature
  }
}
