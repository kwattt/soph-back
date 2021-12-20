import {Intents} from 'discord.js'
import Client from './Client'

const client = new Client({
  intents: 
    [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES
    ]  
})

client.start().then(() => {
})

client.once('ready', c => {
	console.log('Bot cargado correctamente!');
});

export default client