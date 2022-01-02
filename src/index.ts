require('dotenv').config();

import express from "express";
import cors from 'cors';
import helmet from 'helmet'
import compression from 'compression'

import redisSession from "./middleware/auth/session";
import rest from './routes'
import discord from './middleware/discord'
import body from './middleware/body'
import path from 'path'

const whitelist = [ 'http://localhost:3000', 'http://localhost:3001', 'https://sophii.kv-at.com', 'http://127.0.0.1:3000',  'http://127.0.0.1:3001', 'http://127.0.0.1:5000']
const corsapp = cors({
  credentials: true,
  origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true)
      } else { 
        callback(null, false)
      }
  }
})

const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(), 
      "img-src": ["'self'", 'data:', 'https://cdn.discordapp.com'],
      "connect-src": ["'self'", 'https://discord.com/api/v8/oauth2/token']
    }
  }
}))

app.use(compression())
app.use(body)
app.use(corsapp)
app.use(redisSession)
app.use(discord)

app.use(rest)

app.use(express.static(path.join(__dirname, '../build')))
app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

app.listen(process.env.APP_PORT, () => {console.log('listening on port ' + process.env.APP_PORT);})

export default app