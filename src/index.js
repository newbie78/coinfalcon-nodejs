import api from 'api'
import websocket from 'websocket'

export default (opts = {}) => ({
  ...api(opts),
  ws: websocket(opts)
})
