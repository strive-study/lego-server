import { WorkProps } from 'app/model/work'
import { Service } from 'egg'
import { Types } from 'mongoose'
// import { Types } from 'mongoose'
import { nanoid } from 'nanoid'

export default class WorkSerive extends Service {
  async createEmptyWork(payload: WorkProps) {
    const { ctx } = this
    const { username, _id } = ctx.state.user
    const uuid = nanoid(6)

    const newEmptyWork: Partial<WorkProps> = {
      ...payload,
      user: Types.ObjectId(_id) as any,
      author: username,
      uuid
    }
    return ctx.model.Work.create(newEmptyWork)
  }
}
