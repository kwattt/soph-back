import redis from 'redis'

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

export default redisClient