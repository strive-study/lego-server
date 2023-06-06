import { Context, Application, EggAppConfig } from 'egg'
import { appendFileSync } from 'fs'

export default (_options: EggAppConfig['myLogger'], _app: Application) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const startTime = Date.now()
    const requestTime = new Date()
    await next()
    const endTime = Date.now()
    const ms = endTime - startTime
    const logTime = `${requestTime} -- ${ctx.method} -- ${ctx.url} -- ${ms}ms`
    // if (options.allowedMethod.includes(ctx.method)) {
    appendFileSync('./log.txt', logTime + '\n')
    // }
  }
}
