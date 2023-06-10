import { Service } from 'egg'
import { UserProps } from 'app/model/user'
import * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import Util, * as $Util from '@alicloud/tea-util'

interface GiteeUserRes {
  id: number
  login: string
  name: string
  avatar_url
  email: string
}
export default class UserService extends Service {
  /**
   * 邮箱创建
   * @param payload
   */
  async createByEmail(payload: UserProps) {
    const { ctx } = this
    const { username, password } = payload
    const hash = await ctx.genHash(password)
    const userCreatedData: Partial<UserProps> = {
      username,
      password: hash,
      email: username
    }
    return ctx.model.User.create(userCreatedData)
  }

  async findById(id: string) {
    return this.ctx.model.User.findById(id)
  }

  async findByUsername(username: string) {
    return this.ctx.model.User.findOne({ username })
  }

  async loginByPhoneNumber(phoneNumber: string) {
    const { ctx, app } = this
    const userInfo = await this.findByUsername(phoneNumber)
    // 如果没有 就注册
    if (userInfo) {
      const token = app.jwt.sign(
        { username: userInfo.username, _id: userInfo._id },
        app.config.jwt.secret,
        { expiresIn: app.config.jwtExpires }
      )
      return token
    }
    const userCreatedData: Partial<UserProps> = {
      username: phoneNumber,
      phoneNumber,
      nickName: `lego${phoneNumber.slice(-4)}`,
      type: 'phoneNumber'
    }

    const newUser = await ctx.model.User.create(userCreatedData)
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret,
      { expiresIn: app.config.jwtExpires }
    )
    return token
  }

  /**
   * 给手机号发送短信
   * @param phoneNumber
   * @param veriCode
   * @returns
   */
  async sendSMS(phoneNumber: string, veriCode: string) {
    phoneNumber = '18845778092'
    const { app } = this
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName: '阿里云短信测试',
      templateCode: 'SMS_154950909',
      phoneNumbers: phoneNumber,
      templateParam: `{"code":"${veriCode}"}`
    })
    let runtime = new $Util.RuntimeOptions({})
    try {
      // 复制代码运行请自行打印 API 的返回值
      const res = await app.ALClient.sendSmsWithOptions(sendSmsRequest, runtime)
      return res
    } catch (error: any) {
      // 如有需要，请打印 error
      Util.assertAsString(error.message)
      console.log(error)
    }
  }

  /**
   * 获取gitee AccessToken
   * @param code
   * @returns
   */
  async getAccessToken(code: string) {
    const { ctx, app } = this
    const { cid, secret, redirectURL, authURL } = app.config.giteeOauthConfig
    const { data } = await ctx.curl(authURL, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: cid,
        redirect_uri: redirectURL,
        client_secret: secret
      }
    })
    app.logger.info(data)
    return data.access_token
  }

  /**
   * 获取gitee 用户信息
   * @param access_token
   */
  async getGiteeUserData(access_token: string) {
    const { ctx, app } = this
    const { giteeUserAPI } = app.config.giteeOauthConfig
    const { data } = await ctx.curl<GiteeUserRes>(
      `${giteeUserAPI}?access_token=${access_token}`,
      {
        dataType: 'json'
      }
    )
    return data
  }

  async loginByGitee(code: string) {
    const { app, ctx } = this
    // 获取token
    const accessToken = await this.getAccessToken(code)
    // 获取用户信息
    const user = await this.getGiteeUserData(accessToken)
    // 检查用户信息是否存在
    const { id, name, avatar_url, email } = user
    const stringId = id.toString()
    const existUser = await this.findByUsername(`Gitee${stringId}`)
    if (existUser) {
      const token = app.jwt.sign(
        { username: existUser.username, _id: existUser._id },
        app.config.jwt.secret,
        { expiresIn: app.config.jwtExpires }
      )
      return token
    }
    // 不存在
    const userCreatedData: Partial<UserProps> = {
      oauthId: stringId,
      provider: 'gitee',
      username: `Gitee${stringId}`,
      picture: avatar_url,
      nickName: name,
      email,
      type: 'oauth'
    }
    const newUser = await ctx.model.User.create(userCreatedData)
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret,
      { expiresIn: app.config.jwtExpires }
    )
    return token
  }
}
