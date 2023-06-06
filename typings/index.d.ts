import { UserProps } from 'app/model/user'
import 'egg'
import { Model } from 'mongoose'
import OSS, { Options } from 'ali-oss'
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
    oss: OSS
  }
  interface EggAppConfig {
    bcrypt: {
      saltRounds: number
    }
    oss: {
      client?: Options
    }
  }

  interface Application {
    sessionMap: {
      [key: string]: any
    }
    sessionStore: any
    oss: OSS
  }
}
