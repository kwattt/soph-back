import axios, { AxiosResponse } from 'axios';
import {APIUser, RESTGetAPICurrentUserGuildsResult} from 'discord-api-types';

// NEEDS REFACTOR AND ERROR HANDLING..

export const API_getGuilds = async (token : string) : Promise<RESTGetAPICurrentUserGuildsResult | 'err'>  => {
  try {
    const responseGuild : AxiosResponse<RESTGetAPICurrentUserGuildsResult> = await axios.get('https://discord.com/api/v8/users/@me/guilds',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if(responseGuild.status === 200){
      let newData : RESTGetAPICurrentUserGuildsResult = responseGuild.data.map(cguild => {
        return {...cguild, features: []}
      })  
      return newData  
    } else {
      return 'err'
    }
  } catch (err) {
  }
  return 'err'
}

export const API_getUser = async (token : string) : Promise<APIUser | 'err'>  => {
  try {
    const responseUser : AxiosResponse<APIUser> = await axios.get('https://discord.com/api/v8/users/@me',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  
    if(responseUser.status === 200){
      return responseUser.data
    } else {
      return 'err'
    }
  } catch (err) {
  }

  return 'err'


}
