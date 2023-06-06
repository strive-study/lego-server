import { GlobalErrorType } from 'app/error'
import { Controller } from 'egg'
export default function inputValidate(
  rules: any,
  errorType: GlobalErrorType
): MethodDecorator {
  return function (_prototype, _key, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      const that = this as Controller
      //@ts-ignore
      const { ctx, app } = that
      const errors = app.validator.validate(rules, ctx.request.body)
      if (errors) {
        return ctx.helper.error({ ctx, errorType, error: errors })
      }
      return originalMethod.apply(this, args)
    }
  }
}
