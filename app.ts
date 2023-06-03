import { IBoot } from 'egg'

export default class AppBoot implements IBoot {
  // private readonly app: Application
  // constructor(app: Application) {
  //   // this.app = app
  //   // const { url } = this.app.config.mongoose
  //   // assert(url, '[egg-mongoose] url is required on config')
  //   // const db = createConnection(url)
  //   // db.on('connected', () => {
  //   //   app.logger.info(`[egg-mongoose] ${url} connected successfully`)
  //   // })
  //   // app.mongoose = db
  // }

  // configWillLoad(): void {
  //   this.app.config.coreMiddleware.unshift('myLogger')
  // }

  async willReady(): Promise<void> {
    // console.log('this.app.config.baseDir', this.app.config.baseDir)
    // const dir = path.join(this.app.config.baseDir, 'app/model')
    // // app/model/user.ts => app.model.User
    // this.app.loader.loadToApp(dir, 'model', {
    //   caseStyle: 'upper'
    // })
  }
}
