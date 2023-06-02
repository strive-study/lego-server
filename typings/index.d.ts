import { UserProps } from 'app/model/user'
import 'egg'
import { Connection, Model } from 'mongoose'
declare module 'egg' {
  // 自动映射model类型
  interface MongooseModels extends IModel {
    [key: string]: Model<any>
  }
  interface Application {
    mongoose: Connection
    model: MongooseModels
  }
}
