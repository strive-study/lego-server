import { UserProps } from 'app/model/user'
import 'egg'
import { Model } from 'mongoose'
declare module 'egg' {
  // 自动映射model类型
  interface MongooseModels extends IModel {
    [key: string]: Model<any>
  }
  // interface Application {
  //   mongoose: Connection
  //   model: MongooseModels
  // }
  interface Context {
    genHash(plainText: string): Promise<string>
    compare(plainText: string, hash: sting): Promise<boolean>
  }
  interface EggAppConfig {
    bcrypt: {
      saltRounds: number
    }
  }

  interface Application {
    sessionMap: {
      [key: string]: any
    }
    sessionStore: any
  }
}
