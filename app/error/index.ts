import { userErrorMessages } from './user'
import { workErrorMessages } from './work'

export const globalErrorMessages = {
  ...userErrorMessages,
  ...workErrorMessages
}

export type GlobalErrorType = keyof (typeof userErrorMessages &
  typeof workErrorMessages)
