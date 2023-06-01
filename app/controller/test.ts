import { Controller } from 'egg'

export default class TestController extends Controller {
  async index() {
    // this.ctx.response.body = 'hello world'
    // this.ctx.response.status = 200 //返回状态码
    const { ctx, config: config1 } = this
    const { config: config2 } = ctx.app
    const res = await (this.app as any).axiosInstance.get(
      '/api/breeds/image/random'
    )
    console.log('res---', res.data)
    ctx.logger.debug('debug info')
    ctx.logger.info('res data')
    ctx.helper.success({
      ctx,
      msg: '哦了',
      res: {
        config1: config1.baseUrl,
        config2: config2.baseUrl
      }
    })
  }
  async getDog() {
    const { service, ctx } = this
    const res = await service.dog.show()
    await ctx.render('test.nj', { url: res.message })
    ctx.status = 200
  }
}
