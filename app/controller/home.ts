import { Controller } from 'egg'
import pkg from '../../package.json'

export default class HomeController extends Controller {
  async index() {
    const { ctx } = this
    const { status } = ctx.app.redis
    const { version } = await ctx.app.mongoose.connection.db.command({
      buildInfo: 1
    })
    ctx.helper.success({
      ctx,
      res: {
        dbVersion: version,
        redisStatus: status,
        version: pkg.version
      }
    })
  }
}
