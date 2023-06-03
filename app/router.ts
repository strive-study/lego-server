import { Application } from 'egg'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  const jwt = app.middleware.jwt({ secret: app.config.jwt.secret })
  // router.get('/test/:id', controller.test.index)
  // router.get('/dog', controller.test.getDog)

  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/current', jwt, controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
}
