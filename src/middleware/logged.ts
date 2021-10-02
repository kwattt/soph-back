import {Request} from 'express'

const isLogged = (req: Request) : boolean => {
  const session = req.session
  if(session.user){
    return true
  }
  return false
}

export default isLogged