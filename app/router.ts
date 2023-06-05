import { Application } from 'egg'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  // const jwt = app.middleware.jwt({ secret: app.config.jwt.secret })
  // router.get('/test/:id', controller.test.index)
  // router.get('/dog', controller.test.getDog)

  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/getUserInfo', (app as any).jwt, controller.user.show)
  router.post('/api/users/loginByEmail', controller.user.loginByEmail)
  router.post(
    '/api/users/loginByPhoneNumber',
    controller.user.loginByPhoneNumber
  )
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.get('/api/users/passport/gitee', controller.user.oauth)
  router.get('/api/users/passport/gitee/callback', controller.user.oauthByGitee)

  router.get('/api/works', (app as any).jwt, controller.work.createWork)
}
