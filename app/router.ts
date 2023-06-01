import { Application } from 'typings/app'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  router.get('/test/:id', controller.test.index)
  router.get('/dog', controller.test.getDog)
}
