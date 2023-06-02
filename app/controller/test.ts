import { Controller } from 'egg'

export default class TestController extends Controller {
  async index() {
    const { ctx } = this
    const persons = await ctx.service.dog.showPlayes()
    ctx.helper.success({
      ctx,
      msg: '哦了',
      res: persons
    })
    ctx.logger.info('index方法到底了')
  }
  // async getDog() {
  //   const { service, ctx } = this
  //   const res = await service.dog.show()
  //   await ctx.render('test.nj', { url: res.message })
  //   ctx.status = 200
  // }
}
