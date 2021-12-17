// Gracias discord por obligarnos a utilizar slash commands!
import {SlashCommandBuilder} from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';

/*
  Actualmente no es posible setear permisos generales para los comandos ????? únicamente por guild/usuario. 
  https://github.com/discord/discord-api-docs/issues/2315

  No es posible utilizar alias en comandos.
  https://github.com/discord/discord-api-docs/issues/2323#issuecomment-761137779

  No existen categorias de comandos.
  Existen subcomandos, sin embargo no permiten categorizarlos.

  Posiblemente necesite un nuevo handler para las acciones de menú.
*/

export default interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  action: (interaction : CommandInteraction) => any
}