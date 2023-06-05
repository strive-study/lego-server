import axios, { AxiosInstance } from 'axios'
import { Application } from 'egg'
import Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import * as $OpenApi from '@alicloud/openapi-client'
const AXIOS = Symbol('Application#axios')
const ALIClient = Symbol('Application#ALClient')
export default {
  echo(msg: string) {
    const that = this as unknown as Application
    return `hello ${msg}${that.config.name}`
  },
  get axiosInstance(): AxiosInstance {
    if (!this[AXIOS]) {
      console.log('创建')
      this[AXIOS] = axios.create({
        baseURL: 'https://dog.ceo',
        timeout: 5000
      })
    }
    return this[AXIOS]
  },
  get ALClient(): Dysmsapi20170525 {
    const that = this as unknown as Application
    const { accessKeyId, accessKeySecret, endpoint } =
      that.config.aliCloudConfig
    if (!this[ALIClient]) {
      const config = new $OpenApi.Config({
        // 必填，您的 AccessKey ID
        accessKeyId,
        // 必填，您的 AccessKey Secret
        accessKeySecret
      })
      // 访问的域名
      config.endpoint = endpoint
      this[ALIClient] = new Dysmsapi20170525(config)
    }
    return this[ALIClient]
  }
}
