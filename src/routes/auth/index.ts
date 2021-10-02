import { Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import url from 'url'
import { User } from '../../middleware/User';

const REDIRECT_URI = `https://discord.com/api/oauth2/authorize?client_id=657839781509857302&redirect_uri=${encodeURIComponent(process.env.DISCORD_URI || '')}&response_type=code&scope=identify%20guilds`

const router = Router()

router.get('/redirect', async (req, res) => {
  const { code } = req.query

  console.log('user:', req.session.user)
  if(req.session.user){
    res.redirect('/api/test')
    return
  }

  if(code){
    const responseData = new url.URLSearchParams({
      client_id: process.env.DISCORD_OAUTH_ID!,
      client_secret: process.env.DISCORD_OAUTH_SECRET!,
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: process.env.DISCORD_URI!
    })

    try {
      const response : AxiosResponse<User> = await axios.post('https://discord.com/api/v8/oauth2/token',
      responseData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      const data = response.data

      const userData = {
        access_token: data.access_token,
        expires_in: data.expires_in,
        scope: data.scope,
        token_type: data.token_type
      }

      const session = req.session;
      session.user = userData

      res.redirect('/')
      return

    } catch (err) {
      console.log('error:', err)
      res.sendStatus(500)
    }
  }
  else {
    res.redirect('/')
    return
  }  
})

router.get('/login', async (req, res) => {
  res.redirect(REDIRECT_URI)
})

router.get('/revoke', async (req, res) => {
  req.session.destroy(err => {
    if(err)
      console.log('error:', err)
  })
  res.redirect('/')
})

export default router