import { Router } from 'express'
import messages from './messages.json'
import client from './../../../discord'

const router = Router()

var memberCount: Number = 0, guildCount : Number = 0

router.get('/stats', (req, res) => {
  res.send({
    message: messages.messages[Math.floor(Math.random() * messages.messages.length)],
    guilds: guildCount,
    users: memberCount
  })
})

const updateStats = () => {
  guildCount = client.guilds.cache.size
  memberCount = client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)
}
setInterval(updateStats, 60000)

export default router