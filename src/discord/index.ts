import {Client, Intents} from 'discord.js'

const client = new Client({
  intents: 
          [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS
          ]  
})

client.on('ready', () => {
  console.log('Discord.js client loaded, ID:', client.user?.id)
})

client.login(process.env.DISCORD_BOT_TOKEN)

export default client