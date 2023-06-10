import { GlobalErrorType } from 'app/error'
import defineRoles from 'app/roles/roles'
import { Controller } from 'egg'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference } from 'lodash'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete'
}
const options = { fieldsFrom: rule => rule.fields || [] }
export default function checkPermission(
  modelName: string,
  errorType: GlobalErrorType,
  _userKey = 'user'
): MethodDecorator {
  return function (_property, _key, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller
      // @ts-ignore
      const { ctx } = that
      const { id } = ctx.params
      const { method } = ctx.request
      const action = caslMethodMapping[method]
      let permission = false
      let keyPermission = true
      if (!ctx.state || !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      const ability = defineRoles(ctx.state.user)
      const rule = ability.relevantRuleFor(action, modelName)

      // 有条件限制
      if (rule && rule.conditions) {
        const certainRecord = await ctx.model[modelName].findOne({ id }).lean()
        // 查询对象和modelName绑定
        permission = ability.can(action, subject(modelName, certainRecord))
      } else {
        permission = ability.can(action, modelName)
      }
      // 判断rule中是否有对应受限字段
      if (rule && rule.fields) {
        const fields = permittedFieldsOf(ability, action, modelName, options)
        if (fields.length > 0) {
          const payloadKeys = Object.keys(ctx.request.body)
          const diffKeys = difference(payloadKeys, fields)
          console.log('diffKeys', diffKeys)
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
