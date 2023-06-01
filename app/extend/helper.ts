import { Context } from 'egg'
interface RespType {
  ctx: Context
  res?: any
  msg?: string
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      error: 0,
      data: res ? res : null,
      message: msg ? msg : '请求成功'
    }
    ctx.status = 200
  }
}
