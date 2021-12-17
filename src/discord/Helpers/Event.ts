import { ClientEvents } from "discord.js";
import Client from './../Client'

export default interface Event {
  name: keyof ClientEvents
  once?: boolean
  action: (client: Client, ...args: any[]) => any
}