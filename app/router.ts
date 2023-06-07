import { Application } from 'egg'

export default (app: Application) => {
  // const logger = app.middleware.myLogger({ allowedMethod: ['POST'] }, app)
  const { controller, router } = app
  // const jwt = app.middleware.jwt({ secret: app.config.jwt.secret })
  router.prefix('/api')
  // user
  router.post('/users/create', controller.user.createByEmail)
  router.get('/users/getUserInfo', controller.user.show)
  router.post('/users/loginByEmail', controller.user.loginByEmail)
  router.post('/users/loginByPhoneNumber', controller.user.loginByPhoneNumber)
  router.post('/users/genVeriCode', controller.user.sendVeriCode)
  router.get('/users/passport/gitee', controller.user.oauth)
  router.get('/users/passport/gitee/callback', controller.user.oauthByGitee)

  // work
  router.post('/works', controller.work.createWork)
  router.get('/works', controller.work.myList)
  router.post('/works/copy/:id', controller.work.copyWork)
  router.get('/works/:id', controller.work.myWork)
  router.get('/templates', controller.work.getTemplateList)
  router.get('/templates/:id', controller.work.template)
  router.patch('/works/:id', controller.work.update)
  router.delete('/works/:id', controller.work.delete)
  router.post('/works/publish/:id', controller.work.publishWork)
  router.post('/works/publish-template/:id', controller.work.publishTemplate)

  // file to local
  // router.post('/utils/upload', controller.utils.fileLocalUpload)
  // stream to local
  // router.post('/utils/upload', controller.utils.fileUploadByStream)
  // stream to OSS
  // router.post('/utils/upload', controller.utils.uploadToOss)
  // test busboy
  // router.post('/utils/upload', controller.utils.testBusboy)
  // co-busboy
  router.post('/utils/upload-img', controller.utils.uploadMultipleFiles)
}
