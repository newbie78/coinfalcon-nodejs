import dotenv from 'dotenv'
dotenv.load()

require('./unauthenticated')
require('./websocket')

if (process.env.API_KEY && process.env.API_SECRET) {
  require('./authenticated')
  require('./websocket-auth')
}
