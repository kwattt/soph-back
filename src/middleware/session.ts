import redis from 'redis'
import connectRedis from 'connect-redis'
import session from 'express-session'
import { User } from './User'

const RedisStore = connectRedis(session)
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379
})

redisClient.on('connect', function (err) {
  console.log('Connected to redis successfully');
})

redisClient.on('error', function (err) {
  console.log('Could not establish a connection with redis. ' + err);
})

const redisSession = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.COOKIE_SECRET || "undefined_secret",
  resave: false,
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
      user: User
  }
}

export default redisSession