import {Client, Intents} from 'discord.js'
import {Router} from 'express'

var LOADED_CLIENT = false

export const client = new Client({
  intents: 
          [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS
          ]  
})

client.on('ready', () => {
  console.log('Discord.js client loaded, ID:', client.user?.id)
  LOADED_CLIENT = true
})

client.login(process.env.DISCORD_BOT_TOKEN)

const router = Router()
router.use((req, res, next) => {
  req.client = client
  next();
})

declare global {
  namespace Express {
    interface Request {
      client: Client
    }
  }
}

export default router