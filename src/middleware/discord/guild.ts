import {Router, Request} from 'express'
import {PrismaClient } from '@prisma/client'
import {Permissions} from 'discord.js'

export const guildAccess = Router()
export const guildExists = Router()
const prisma = new PrismaClient();

guildExists.use( async (req, res, next) => {
  var result = await prisma.guilds.findUnique({
    where: {
      guild: String(req.query.guild),
    },
  })
  if(!result){
    res.sendStatus(404)
    return false
  }

  req.guild_type = result.type === 1 ? 1 : 0

  console.log(req.guild_type)

  next()
})

guildAccess.use( async (req, res, next) => {
  if(!req.query.guild){
    res.sendStatus(403)
    return false
  }

  if(!canEditGuild(req, String(req.query.guild))){
    res.sendStatus(403)
    return false
  }
  next()
})

const canEditGuild = (req : Request, guildId : string) : boolean => {
  if(!guildId) return false
  if(!req.session.guilds) return false
  let guilds = req.session.guilds

  const user_guilds = guilds.filter(guild => {
    let permission = new Permissions(BigInt(guild.permissions))
    return permission.has(Permissions.FLAGS.MANAGE_GUILD)}
  ).map(guild => {return guild.id})

  if(user_guilds.includes(guildId))
    return true

  return false
}
