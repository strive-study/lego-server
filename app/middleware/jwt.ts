import { verify } from 'jsonwebtoken'
import { Context, EggAppConfig } from 'egg'

function getTokenValue(ctx: Context) {
  const { authorization } = ctx.header
  if (!ctx.header || !authorization) {
    return false
  }
  if (typeof authorization === 'string') {
    const parts = authorization.trim().split(' ')
    if (parts.length === 2) {
      const schema = parts[0]
      const credentials = parts[1]
      if (/^Bearer$/i.test(schema)) {
        return credentials
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

export default (options: EggAppConfig['jwt']) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    // 从header 获取token
    const token = getTokenValue(ctx)
    if (!token) {
      return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    }
    const { secret } = options
    if (!secret) {
      throw new Error('Secret not provided')
    }
    try {
      const decoded = verify(token, secret)
      ctx.state.user = decoded
      await next()
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    }
  }
}
