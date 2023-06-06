import { Controller } from 'egg'
import inputValidate from 'app/decorator/inputValidate'
const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}

const sendCodeRules = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误'
  }
}
const userPhoneCreateRules = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误'
  },
  veriCode: { type: 'string', format: /^\d{4}$/, message: '验证码格式错误' }
}

export default class UserController extends Controller {
  @inputValidate(userCreateRules, 'userValidateFail')
  async createByEmail() {
    const { ctx, service } = this
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

  @inputValidate(userCreateRules, 'userValidateFail')
  async loginByEmail() {
    const { ctx, service, app } = this
    // 检查用户输入
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
    // ctx.cookies.set('username', userInfo.username, { encrypt: true, })
    // ctx.session.username = userInfo.username
    const token = (app as any).jwt.sign(
      { username: userInfo.username },
      app.config.jwt.secret,
      {
        expiresIn: 60 * 60
      }
    )
    // 登录成功
    // ctx.helper.success({ ctx, res: userInfo.toJSON(), msg: '登录成功' })
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }

  @inputValidate(userPhoneCreateRules, 'userValidateFail')
  async loginByPhoneNumber() {
    const { ctx, app } = this
    const { phoneNumber, veriCode } = ctx.request.body

    const preVeriCode = await (app as any).redis.get(
      `phoneVeriCode-${phoneNumber}`
    )
    if (preVeriCode !== veriCode) {
      return ctx.helper.error({
        ctx,
        errorType: 'loginVeriCodeIncorrectFailInfo'
      })
    }
    const token = await ctx.service.user.loginByPhoneNumber(phoneNumber)
    ctx.helper.success({ res: token, ctx })
  }

  @inputValidate(sendCodeRules, 'userValidateFail')
  async sendVeriCode() {
    const { ctx, app } = this
    const { phoneNumber } = ctx.request.body
    // 获取redis缓存
    const preVeriCode = await (app as any).redis.get(
      `phoneVeriCode-${phoneNumber}`
    )
    if (preVeriCode) {
      return ctx.helper.error({
        ctx,
        errorType: 'sendVeriCodeFrequentlyFailInfo'
      })
    }

    // 1000 - 9999验证码
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString()
    // 生产环境发送短信
    if (app.config.env === 'prod') {
      const res = await ctx.service.user.sendSMS(phoneNumber, veriCode)
      if (res?.body.code !== 'OK') {
        return ctx.helper.error({ ctx, errorType: 'sendVeriCodeError' })
      }
    }
    await (app as any).redis.set(
      `phoneVeriCode-${phoneNumber}`,
      veriCode,
      'ex',
      60
    )
    ctx.helper.success({
      ctx,
      msg: '验证码发送成功',
      res: app.config.env === 'local' ? { veriCode } : null
    })
  }

  // 选择第三方登录
  async oauth() {
    const { app, ctx } = this
    const { cid, redirectURL } = app.config.giteeOauthConfig
    ctx.redirect(
      `https://gitee.com/oauth/authorize?client_id=${cid}&redirect_uri=${redirectURL}&response_type=code`
    )
  }

  // 点击同意授权跳转url请求
  async oauthByGitee() {
    const { ctx } = this
    const { code } = ctx.request.query
    try {
      const token = await ctx.service.user.loginByGitee(code)
      await ctx.render('success.nj', { token })
    } catch (error) {
      ctx.helper.error({ ctx, errorType: 'giteeOauthError' })
    }
  }

  async show() {
    const { ctx, service } = this
    // const { username } = ctx.session
    // if (!username) {
    //   return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    // }
    // ctx.helper.success({ res: username, ctx })
    // const username = ctx.cookies.get('username', { encrypt: true })

    // const userData = await service.user.findById(ctx.state.user.username)
    const userData = await service.user.findByUsername(ctx.state.user.username)
    ctx.helper.success({ res: userData, ctx })
  }
}
