import connectRedis from 'connect-redis'
import session from 'express-session'
import { APIUser, RESTGetAPICurrentUserGuildsResult, RESTPostOAuth2AccessTokenResult } from 'discord-api-types'
import redisClient from '../redis'

const RedisStore = connectRedis(session)

const redisSession = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.COOKIE_SECRET || "undefined_secret",
  resave: false,
  name: "session-1",
  saveUninitialized: false,
  cookie: {
      sameSite: 'lax',
      secure: process.env.APP_ENV === 'DEV' ? false : true, 
      httpOnly: true,  
      maxAge: 259200000
  } 
})

declare module 'express-session' {
  interface SessionData {
      access: RESTPostOAuth2AccessTokenResult
      user: APIUser
      guilds: RESTGetAPICurrentUserGuildsResult
  }
}

export default redisSession