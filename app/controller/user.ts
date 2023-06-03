import { Controller } from 'egg'
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}

export const userErrorMessages = {
  userValidateFail: {
    errno: 101001,
    message: '输入信息验证失败'
  },
  createUserAlreadyExists: {
    errno: 101002,
    message: '该邮箱已被注册，请直接登录'
  },
  loginCheckFailInfo: {
    errno: 101001,
    message: '用户不存在或者密码错误'
  }
}

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service } = this
    const errors = this.validateUserInput()
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'userValidateFail',
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

  async loginByEmail() {
    const { ctx, service } = this
    // 检查用户输入
    const errors = this.validateUserInput()
    if (errors) {
      return ctx.helper.error({
        ctx,
        errorType: 'userValidateFail',
        error: errors
      })
    }
    const { username, password } = ctx.request.body
    const userInfo = await service.user.findByUsername(username)
    // 检查用户是否存在
    if (!userInfo) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }

    // 密码不正确
    const verifyPwd = await ctx.compare(password, userInfo.password)
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    // 登录成功
    ctx.helper.success({ ctx, res: userInfo.toJSON(), msg: '登录成功' })
  }

  async findById() {
    const { ctx, service } = this
    const userData = await service.user.findById(ctx.params.id)
    ctx.helper.success({ res: userData, ctx })
  }

  validateUserInput() {
    const { ctx, app } = this
    // ctx.validate(userCreateRules)
    const errors = app.validator.validate(userCreateRules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }
}
