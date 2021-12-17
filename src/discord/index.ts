import {Intents} from 'discord.js'
import Client from './Client'

const client = new Client({
  intents: 
    [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES
    ]  
})

client.start().then(() => {
})

export default client