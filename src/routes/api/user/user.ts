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

router.post('/updateInfo', async(req, res) => {
  let user = req.session.user
  if(user){
    const data = req.body
    const {month, day} = data

    const result = await prisma.users.findUnique({
      where: {
        uid: String(user.id),
      }
    })

    if(month && day){

      if(result) await prisma.users.update({
        where: {uid: user.id},
        data: {
          month,
          day
        }
      })
      else await prisma.users.create({
        data: {
          uid: user.id,
          month: month,
          day: day
        }
      })
    }

    else if(result) await prisma.users.delete({
      where: {uid: user.id}
    })
    res.sendStatus(200)
    return
  }
  res.sendStatus(404)
})

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
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: avatar,
      banner: user.banner,
      ...result
    }) 
    return 
  }
  res.sendStatus(404)
})

export default router