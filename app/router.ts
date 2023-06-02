import { Application } from 'egg'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  // router.get('/test/:id', controller.test.index)
  // router.get('/dog', controller.test.getDog)

  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/:id', controller.user.findById)
}
