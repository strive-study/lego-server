import { Service } from 'egg'
import { UserProps } from 'app/model/user'

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
}
