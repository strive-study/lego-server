import { Application } from 'egg'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  const jwtMiddleware = app.jwt as any
  // const jwt = app.middleware.jwt({ secret: app.config.jwt.secret })

  // user
  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/getUserInfo', jwtMiddleware, controller.user.show)
  router.post('/api/users/loginByEmail', controller.user.loginByEmail)
  router.post(
    '/api/users/loginByPhoneNumber',
    controller.user.loginByPhoneNumber
  )
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.get('/api/users/passport/gitee', controller.user.oauth)
  router.get('/api/users/passport/gitee/callback', controller.user.oauthByGitee)

  // work
  router.post('/api/works', jwtMiddleware, controller.work.createWork)
  router.get('/api/works', jwtMiddleware, controller.work.myList)
  router.post('/api/works/copy/:id', jwtMiddleware, controller.work.copyWork)
  router.get('/api/works/:id', jwtMiddleware, controller.work.myWork)
  router.get('/api/templates', jwtMiddleware, controller.work.getTemplateList)
  router.get('/api/templates/:id', controller.work.template)
  router.patch('/api/works/:id', jwtMiddleware, controller.work.update)
  router.delete('/api/works/:id', jwtMiddleware, controller.work.delete)
  router.post(
    '/api/works/publish/:id',
    jwtMiddleware,
    controller.work.publishWork
  )
  router.post(
    '/api/works/publish-template/:id',
    jwtMiddleware,
    controller.work.publishTemplate
  )

  // file to local
  // router.post('/api/utils/upload', controller.utils.fileLocalUpload)
  // stream to local
  // router.post('/api/utils/upload', controller.utils.fileUploadByStream)
  // stream to OSS
  // router.post('/api/utils/upload', controller.utils.uploadToOss)
  // test busboy
  // router.post('/api/utils/upload', controller.utils.testBusboy)
  // test co-busboy
  router.post('/api/utils/upload-img', controller.utils.uploadMultipleFiles)
}
