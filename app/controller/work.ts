import { Controller } from 'egg'
import { nanoid } from 'nanoid'
import inputValidate from 'app/decorator/inputValidate'
import checkPermission from 'app/decorator/checkPermission'

export interface IndexCondition {
  pageIndex?: number
  pageSize?: number
  select?: string | string[]
  populate?: { path?: string; select?: string } | string
  customSort?: Record<string, any>
  find?: Record<string, any>
}
const workCreateRules = {
  title: 'string'
}

export default class WorkController extends Controller {
  // 创建渠道
  // TODO decorator
  async createChannel() {
    const { ctx } = this
    const { name, workId } = ctx.request.body
    const newChannel = {
      name,
      id: nanoid(6)
    }
    const res = await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      {
        $push: {
          channels: newChannel
        }
      }
    )
    if (res) {
      ctx.helper.success({ ctx, res: newChannel })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  async getWorkChannel() {
    const { ctx } = this
    const { id } = ctx.params
    const certainWork = await ctx.model.Work.findOne({ id })
    if (certainWork) {
      const { channels } = certainWork
      ctx.helper.success({
        ctx,
        res: { count: channels?.length || 0, list: channels || [] }
      })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  async updateChannelName() {
    const { ctx } = this
    // channel id
    const { id } = ctx.params
    const { name } = ctx.request.body
    // 根据id查找数组channels中的项，找到某一个项的id等于传递id的一项
    await ctx.model.Work.findOneAndUpdate(
      {
        'channels.id': id
      },
      {
        $set: {
          'channels.$.name': name
        }
      }
    )
    ctx.helper.success({ ctx, res: { name } })
  }

  async deleteChannel() {
    const { ctx } = this
    // channel id
    const { id } = ctx.params
    const work = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      // 删除特定一项 删除channels属性中id等于传入id的一项
      {
        $pull: {
          channels: { id }
        }
      },
      { new: true }
    )
    ctx.helper.success({ ctx, res: work })
  }

  @inputValidate(workCreateRules, 'workValidateFail')
  @checkPermission('Work', 'workNoPermissionFail')
  async createWork() {
    const { ctx, service } = this
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }

  async copyWork() {
    const { ctx } = this
    const { id } = ctx.params
    try {
      const res = await ctx.service.work.copyWork(parseInt(id))
      ctx.helper.success({ ctx, res })
    } catch (e) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async myWork() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOne({ id }).lean()
    ctx.helper.success({ ctx, res })
  }

  async template() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOne({ id }).lean()
    if (!res?.isPublic || !res.isTemplate) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
    ctx.helper.success({ ctx, res })
  }

  async myList() {
    const { ctx, service } = this
    const userId = ctx.state.user._id
    const { pageIndex, pageSize, isTemplate, title } = ctx.query
    const findCondition = {
      user: userId,
      ...(title && { title: { $regx: title, $options: 'i' } }),
      ...(isTemplate && { isTemplate: !!parseInt(isTemplate) })
    }
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: {
        path: 'user',
        select: 'username nickName picture'
      },
      find: findCondition,
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) })
    }

    const res = await service.work.getList(listCondition)
    ctx.helper.success({ ctx, res })
  }

  async getTemplateList() {
    const { ctx } = this
    const { pageIndex, pageSize } = ctx.query
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: {
        path: 'user',
        select: 'username nickName picture'
      },
      find: { isPublic: true, isTemplate: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) })
    }

    const res = await ctx.service.work.getList(listCondition)
    ctx.helper.success({ ctx, res })
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this
    const { id } = ctx.params

    const payload = ctx.request.body
    const res = await this.ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true
    }).lean()
    ctx.helper.success({ ctx, res })
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await this.ctx.model.Work.findOneAndDelete({ id })
      .select('_id id title')
      .lean()
    ctx.helper.success({ ctx, res })
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async publishWork() {
    await this.publish(false)
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async publishTemplate() {
    await this.publish(true)
  }

  @checkPermission('Work', 'workNoPermissionFail')
  async publish(isTemplate: boolean) {
    const { ctx, service } = this
    const url = await service.work.publish(ctx.params.id, isTemplate)
    ctx.helper.success({ ctx, res: { url } })
  }
}
