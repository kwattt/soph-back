import { DiscordAPIError } from 'discord.js'
import {Event} from './../../Helpers'

import status from './status.json'

const changeStatus : Event = {
  name: "ready",
  action: async (client) => {

    const setStatus = async () => {
      client.user?.setPresence(
        {
          status: "online",
          afk: false,
          activities: [
            {
              name: status.status[Math.floor(Math.random() * status.status.length)],
              type: "PLAYING"
            }
          ]
        }
      )
    }

    setInterval(setStatus, 60000)

  }
}

const commandHandling : Event = {
  name: 'interactionCreate',
  action: async (client, interaction) => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
  
    try {
      await command.action(interaction)
    } catch (error) {
      if(error instanceof DiscordAPIError) {
        if(error.code === 50013) {
          interaction.reply("No tengo permisos para realizar esta acción! informar al administrador.")
          return
        }
      }

      console.log(error)
      await interaction.reply({ content: 'Hubo un error al ejecutar este comando :(', ephemeral: true })
    }
  }
}

export const events = [commandHandling, changeStatus]