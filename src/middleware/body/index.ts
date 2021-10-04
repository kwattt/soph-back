import express, {Router, ErrorRequestHandler, Response, Request, NextFunction} from 'express'

const router = Router()
router.use(express.json())

router.use((error: ErrorRequestHandler, req: Request, res : Response, next : NextFunction) => {
  if(error instanceof SyntaxError){ 
    return res.sendStatus(400)
  } else {
    next();
  }
})
export default router
