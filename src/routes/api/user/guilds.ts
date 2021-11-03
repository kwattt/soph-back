import {Router} from 'express'
import { Permissions } from 'discord.js'
import { API_getGuilds } from '../../auth/user.service'
let router = Router()

router.get('/guilds', async (req, res) => {
  const session = req.session
  let tguilds = await API_getGuilds(session.access!.access_token)
  if(tguilds === 'err'){
    res.redirect('/auth/revoke')
    return
  }
  session.guilds = tguilds

  const user = req.session.user
  const guilds = req.session.guilds

  if (user && guilds){
    const user_guilds = guilds.filter(guild => {
      let permission = new Permissions(BigInt(guild.permissions))
      return permission.has(Permissions.FLAGS.MANAGE_GUILD)}
    )
    let cache_guilds = req.client.guilds.cache
    let cross_guilds = user_guilds.filter(guild => cache_guilds.some(guild2 => guild.id === guild2.id))

    let guild_results = cross_guilds.flatMap(guild => {
      let guild_data = req.client.guilds.cache.get(guild.id)
      if (guild_data){
        let channels = guild_data.channels.cache
        let icon = guild_data.iconURL() 
        return {
          id: guild_data.id,
          name: guild_data.name,
          icon: guild_data.icon?.substring(0,2) === 'a_' ? icon?.substring(0, icon?.length-4) + 'gif' : icon,
          banner: guild_data.bannerURL(),
          members: guild_data.memberCount,
          channels: channels.filter(channel => (channel.type === 'GUILD_TEXT' || channel.type === 'GUILD_VOICE')).map(channel => {
            return {
              id: channel.id,
              name: channel.name,
              type: channel.type
            }
          }),
          
          roles: guild_data.roles.cache.map(role => {
            return {
              id: role.id,
              name: role.name
            }
          })
        }   
      }
      else return undefined
    })

    console.log(req.guild_type)

    res.send(guild_results)
    return
  }

  res.send([])
})

export default router