import { Application, IBoot } from 'egg'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
    // app.sessionMap = {}
    // app.sessionStore = {
    //   async get(key) {
    //     app.logger.info('key', key)
    //     return app.sessionMap[key]
    //   },
    //   async set(key, value) {
    //     app.logger.info('key', key)
    //     app.logger.info('value', value)
    //     app.sessionMap[key] = value
    //   },
    //   async destroy(key) {
    //     delete app.sessionMap[key]
    //   }
    // }
  }
  // const { url } = this.app.config.mongoose
  // assert(url, '[egg-mongoose] url is required on config')
  // const db = createConnection(url)
  // db.on('connected', () => {
  //   app.logger.info(`[egg-mongoose] ${url} connected successfully`)
  // })
  // app.mongoose = db
  // }

  configWillLoad(): void {
    // this.app.config.coreMiddleware.unshift('myLogger')
    // 前置于jwt中间件
    this.app.config.coreMiddleware.push('customError')
  }

  async didReady(): Promise<void> {
    console.log('middleware', this.app.middleware)
  }
}
