import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Collection, User } from 'discord.js'
import {Command} from './../../Helpers'

var recordatorios: Collection<string, User> = new Collection()

const enviarRecordatorio = async (user: User, mensaje: string) => {
  if(user.id)
  {
    await user.send(mensaje).catch(() => {
      // no se pudo enviar mensaje.
    })
  }
  if(recordatorios.has(user.id))
    recordatorios.delete(user.id)
}

const recordatorio : Command = {
  data: new SlashCommandBuilder().
    setName('recordatorio').
    setDescription('crea un recordatorio').
    addIntegerOption(option => option.setName('horas').setDescription('Cantidad de horas a recordar').setRequired(true)).
    addIntegerOption(option => option.setName('minutos').setDescription('Cantidad de minutos a recordar').setRequired(true)).
    addStringOption(option => option.setName('mensaje').setDescription('Mensaje del recordatorio').setRequired(true)),
  action: async (interaction: CommandInteraction) => {
    const horas = interaction.options.getInteger('horas')
    const minutos = interaction.options.getInteger('minutos')
    const msg = interaction.options.getString('mensaje')

    if(typeof horas !== 'number' || typeof minutos !== 'number' || typeof msg !== 'string')
      return

    if(horas < 0 || minutos < 0)
    {
      interaction.reply({ephemeral: true, content:"No puedes utilizar numeros negativos :("})
      return
    }

    const miliseconds = (horas * 60 * 60 * 1000) + (minutos * 60 * 1000)

    if(miliseconds <= 0){
      interaction.reply({ephemeral: true, content:"No pusiste ninguna hora válida."})
      return
    }

    if(miliseconds > 72 * 60 * 60 * 1000)
    {
      interaction.reply({ephemeral: true, content:"No puedes recordar más de 72 horas :("})
      return
    }

    if(recordatorios.has(interaction.user.id))
    {
      interaction.reply({ephemeral: true, content: `Solo puedes tener un recordatorio activo.`})
      return
    }

    recordatorios.set(interaction.user.id, interaction.user)
    setTimeout(enviarRecordatorio, miliseconds, interaction.user, msg)
    interaction.reply({ephemeral: true, content: `Recordatorio creado, te enviaré un mensaje en ${horas} horas y ${minutos} minutos.`})
  }
}

export const commands = [recordatorio]