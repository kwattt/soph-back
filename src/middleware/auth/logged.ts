import {Request} from 'express'

const isLogged = (req: Request) : boolean => {
  const session = req.session
  if(session.access){
    return true
  }
  return false
}

export default isLogged