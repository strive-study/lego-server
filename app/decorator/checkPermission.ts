import { GlobalErrorType } from 'app/error'
import defineRoles from 'app/roles/roles'
import { Controller } from 'egg'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference, assign } from 'lodash/fp'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete'
}
interface ModelMapping {
  mongoose: string
  casl: string
}
interface IOptions {
  action?: string //自定义action
  key?: string //查找记录的key 默认id
  // 查找记录时 value的数据来源 默认ctx.params
  // 来源于对应的URL参数或ctx.request.body valueKey为数据来源的键值
  value?: { type: 'params' | 'body'; valueKey: string }
}
const defaultOptions: IOptions = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' }
}
const fieldsOptions = { fieldsFrom: rule => rule.fields || [] }

/**
 *
 * { id : ctx.params.id }
 * { 'channels.id':  ctx.params.id }
 * { 'channels.id':  ctx.request.body.workId }
 */
export default function checkPermission(
  modelName: string | ModelMapping,
  errorType: GlobalErrorType,
  options?: IOptions
): MethodDecorator {
  return function (_property, _key, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller
      // @ts-ignore
      const { ctx } = that
      // const { id } = ctx.params
      const { method } = ctx.request
      const searchOptions = assign(defaultOptions, options || {})
      const { key, value } = searchOptions
      const { type, valueKey } = value!
      // 构建query
      const source = type === 'params' ? ctx.params : ctx.request.body
      const query = {
        [key!]: source[valueKey]
      }
      const mongooseModelName =
        typeof modelName === 'string' ? modelName : modelName.mongoose
      const caslModelName =
        typeof modelName === 'string' ? modelName : modelName.casl
      const action =
        options && options.action ? options.action : caslMethodMapping[method]
      let permission = false
      let keyPermission = true

      if (!ctx.state || !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      const ability = defineRoles(ctx.state.user)
      const rule = ability.relevantRuleFor(action, caslModelName)

      // 有条件限制
      if (rule && rule.conditions) {
        const certainWork = await ctx.model[mongooseModelName]
          .findOne(query)
          .lean()
        // 查询对象和modelName绑定
        permission = ability.can(action, subject(caslModelName, certainWork))
      } else {
        permission = ability.can(action, caslModelName)
      }
      // 判断rule中是否有对应受限字段
      if (rule && rule.fields) {
        const fields = permittedFieldsOf(
          ability,
          action,
          caslModelName,
          fieldsOptions
        )
        if (fields.length > 0) {
          const payloadKeys = Object.keys(ctx.request.body)
          const diffKeys = difference(payloadKeys, fields)
          keyPermission = diffKeys.length === 0
        }
      }
      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType })
      }
      return originalMethod.apply(this, args)
    }
  }
}
