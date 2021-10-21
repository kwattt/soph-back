import { PrismaClient } from '@prisma/client';
import {Router} from 'express'

const router = Router()
const prisma = new PrismaClient();

type User = {
  id: string,
  username: string,
  discriminator: string,
  avatar: string | undefined,
  banner: string | undefined,
  month: number | undefined,
  day: number | undefined,
}

router.get('/info', async (req, res) => {
  let user = req.session.user

  if(user){
    let avatar
    if(user.avatar) avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`

    const result = await prisma.users.findUnique({
      where: {
        uid: String(user.id),
      },
      select: {
        month: true,
        day: true
      }
    })

    res.send({
      ...result,
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: avatar,
      banner: user.banner
    }) 
    return 
  }
  res.sendStatus(404)
})

export default router