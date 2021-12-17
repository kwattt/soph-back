import { Client, ClientOptions, Collection } from "discord.js"
import {REST} from "@discordjs/rest"
import { Command, Event } from "./Helpers"
import { readdirSync, existsSync } from "fs";
import * as path from "path";
import { Routes } from "discord-api-types/v9";

class ExtClient extends Client {
  public commands: Collection<string, Command> = new Collection()
  public alias: Collection<string, Command> = new Collection()
  public events: Collection<string, Event> = new Collection()

  public constructor(params: ClientOptions) {
    super(params)
  }

  private loadModules = async () => {
    const modulePath = path.join(__dirname, "./Modules")

    for await(const file of readdirSync(modulePath)){
      let command_count = 0
      let event_count = 0

      if(existsSync(path.join(modulePath, file, "commands.ts")) || existsSync(path.join(modulePath, file, "commands.js") )) {
        const commands_import = await import(path.join(modulePath, file, "commands"))
        const commands : Command[] = commands_import.commands
        
        if(commands){
          for(const command of commands){
            command_count++
            this.commands.set(command.data.name, command)
          }
        }
      }

      if(existsSync(path.join(modulePath, file, "events.ts")) || existsSync(path.join(modulePath, file, "events.js") )) {
        const events_import = await import(path.join(modulePath, file, "events"))
        const events : Event[] = events_import.events
        
        if(events){
          for(const event of events) {
            event_count++
            this.events.set(event.name, event)
            if(event.once)
              this.once(event.name, event.action.bind(null, this))
            else
              this.on(event.name, event.action.bind(null, this)) 
          }
        }
      }
      console.log(`Found module ${file} [${command_count} commands ${event_count} events]`)
    }
  }

  private registerCommands = async () : Promise<void> => {
    console.log("Registering commands...")
    const rest = new REST({version: '9'}).setToken(process.env.DISCORD_BOT_TOKEN!)
    const to_json = this.commands.map(command => command.data.toJSON())
    if(to_json.length === 0){
      console.log("No commands to register")
      return
    }

    if(process.env.APP_ENV == 'DEV'){
      rest.put(Routes.applicationGuildCommands(process.env.DISCORD_OAUTH_ID!, process.env.DEV_GUILD!), {body: to_json})
        .then(() => {
          console.log("Commands registered (DEV)! => ", to_json.length)
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      rest.put(Routes.applicationCommands(process.env.DISCORD_OAUTH_ID!), {body: to_json})        
        .then(() => {
          console.log("Commands registered (PROD)! => ", to_json.length)
        })
        .catch(err => {
          console.log(err)
        })
    }
  } 

  public start = async (): Promise<void> => {
    await this.loadModules()
    await this.registerCommands()
    await this.login(process.env.DISCORD_BOT_TOKEN!)
  }
}

export default ExtClient