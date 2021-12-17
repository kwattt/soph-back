import {Event} from './../../Helpers'

const commandHandling : Event = {
  name: 'interactionCreate',
  action: async (client, interaction) => {
    if (!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)
    if (!command) return
  
    try {
      await command.action(interaction)
    } catch (error) {
      console.error(error)
      await interaction.reply({ content: 'Hubo un error al ejecutar este comando :(', ephemeral: true })
    }
  
  }
}

export const events = [commandHandling]