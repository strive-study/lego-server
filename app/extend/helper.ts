import { Context } from 'egg'
import { GlobalErrorType, globalErrorMessages } from 'app/error'
interface RespType {
  ctx: Context
  res?: any
  msg?: string
}

interface ErrorRespType {
  ctx: Context
  error?: any //自定义类型
  errorType: GlobalErrorType
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg ? msg : '请求成功'
    }
    ctx.status = 200
  },
  error({ ctx, errorType, error }: ErrorRespType) {
    const { errno, message } = globalErrorMessages[errorType]
    ctx.body = {
      errno,
      message,
      ...(error && { error })
    }
    ctx.status = 200
  }
}
