import { Controller } from 'egg'
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}

export const userErrorMessages = {
  createUserValidateFail: {
    errno: 101001,
    message: '创建用户验证失败'
  },
  createUserAlreadyExists: {
    errno: 101001,
    message: '该邮箱已被注册，请直接登录'
  }
}

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this
    // ctx.validate(userCreateRules)
    const errors = app.validator.validate(userCreateRules, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'createUserValidateFail',
        error: errors
      })
    }
    const userInfo = await service.user.findByUsername(
      ctx.request.body.username
    )
    // 用户名已存在
    if (userInfo) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' })
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ res: userData, ctx })
  }

  async findById() {
    const { ctx, service } = this
    const userData = await service.user.findById(ctx.params.id)
    ctx.helper.success({ res: userData, ctx })
  }
}
