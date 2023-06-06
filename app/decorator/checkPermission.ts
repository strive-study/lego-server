import { GlobalErrorType } from 'app/error'
import { Controller } from 'egg'

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
      const userId = ctx.state.user._id
      const certainWork = await ctx.model[modelName].findOne({ id })
      // ObjectId.toString()
      if (!certainWork || certainWork.user.toString() !== userId) {
        return ctx.helper.error({ ctx, errorType })
      }
      return originalMethod.apply(this, args)
    }
  }
}
