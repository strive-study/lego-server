import axios, { AxiosInstance } from 'axios'
import { Application } from 'egg'
const AXIOS = Symbol('Application#axios')
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
  }
}
