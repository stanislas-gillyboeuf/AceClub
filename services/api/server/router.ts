import { Hono } from 'hono'
import { userRouter } from './user/router'

export const serverRouter = new Hono()

serverRouter.route('/user', userRouter)