import { Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import url from 'url'
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types';
import { API_getGuilds, API_getUser } from './user.service';

const REDIRECT_URI = `https://discord.com/api/oauth2/authorize?client_id=657839781509857302&redirect_uri=${encodeURIComponent(process.env.DISCORD_URI || '')}&response_type=code&scope=identify%20guilds`

const router = Router()

router.get('/redirect', async (req, res) => {
  const session = req.session;

  if(session.access){
    res.redirect(process.env.APP_FRONT_URL!)
    return
  }
  const { code } = req.query

  if(code){

    try {
      const responseAccess : AxiosResponse<RESTPostOAuth2AccessTokenResult> = await axios.post('https://discord.com/api/v8/oauth2/token',
      new url.URLSearchParams({
        client_id: process.env.DISCORD_OAUTH_ID!,
        client_secret: process.env.DISCORD_OAUTH_SECRET!,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: process.env.DISCORD_URI!
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      session.access = responseAccess.data
      
      let tguilds = await API_getGuilds(responseAccess.data.access_token);
      if(tguilds == 'err'){
        res.redirect('/auth/revoke')
        return
      }
      session.guilds = tguilds

      let tuser = await API_getUser(responseAccess.data.access_token);
      if(tuser == 'err'){
        res.redirect('/auth/revoke')
        return
      }
      session.user = tuser

      res.redirect(process.env.APP_FRONT_URL!)
      return

    } catch (err) {
      console.log('error:', err)
      res.sendStatus(500)
    }
  }
  else {
    res.redirect(process.env.APP_FRONT_URL!)
    return
  }  
})

router.get('/login', async (req, res) => {
  res.redirect(REDIRECT_URI)
})

router.get('/revoke', async (req, res) => {
  req.session.destroy(err => {
    if(err){
      res.sendStatus(500)
      console.log('error:', err)
    }
  })
  res.redirect(process.env.APP_FRONT_URL!)
})

export default router