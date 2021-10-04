import {Router} from 'express'

const router = Router()


router.get('/info', (req, res) => {
  let user = req.session.user

  if(user){
    let avatar
    if(user.avatar) avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`

    res.send({
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: avatar,
      banner: user.banner
    })
  }
  res.sendStatus(404)
  res.send(req.session.user)
})

export default router