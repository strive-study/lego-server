import { IBoot, Application } from 'egg'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
  }

  configWillLoad(): void {
    console.log('config middleware', this.app.config.baseUrl)
    console.log('enable middleware', this.app.config.coreMiddleware)
    this.app.config.coreMiddleware.unshift('myLogger')
  }
}
