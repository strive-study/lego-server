import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'
import dotenv from 'dotenv'
import { join } from 'path'

dotenv.config()

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1685372774890_3274'

  // add your egg config in here
  // config.middleware = ['customError']
  // 短信云
  const aliCloudConfig = {
    accessKeyId: process.env.ALC_ACCESS_KEY,
    accessKeySecret: process.env.ALC_SECRET_KEY,
    endpoint: 'dysmsapi.aliyuncs.com'
  }

  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: 'http://localhost:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user'
  }

  // add your special config in here
  // 业务逻辑的配置，插件的配置写到最外层
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
    mongoose: {
      url: 'mongodb://localhost:27017/lego',
      options: {
        user: 'xiaoli',
        pass: '123456'
      }
    },
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: 'http://localhost:7001/api/pages',
    jwtExpires: '24h'
    // myLogger: {
    //   allowedMethod: ['POST', 'GET']
    // }
  }

  config.security = {
    csrf: {
      enable: false
    },
    xframe: {
      enable: false
    },
    domainWhiteList: ['http://localhost:8080']
  }

  config.logger = {
    consoleLevel: 'DEBUG'
  }

  config.view = {
    defaultViewEngine: 'nunjucks'
  }

  config.bcrypt = {
    saltRounds: 10
  }

  config.session = {
    encrypt: false
  }

  config.jwt = {
    secret: process.env.JWT_SECRET || '',
    enable: true,
    match: [
      '/api/users/getUserInfo',
      '/api/works',
      '/api/utils/upload-img',
      '/api/channels'
    ]
  }

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0
    }
  }

  // config.cors = {
  //   origin: 'http://localhost:8080',
  //   allowMethods: 'GET,HEAD,PUT,OPTIONS,POST,DELETE,PATCH'
  // }

  config.multipart = {
    whitelist: ['.png', '.jpg', '.gif', '.webp'],
    fileSize: '400kb'
  }

  config.static = {
    // prefix 默认的
    // dir 文件夹地址
    dir: [
      { prefix: '/public', dir: join(appInfo.baseDir, 'app/public') },
      { prefix: '/uploads', dir: join(appInfo.baseDir, 'uploads') }
    ]
  }

  // oss
  config.oss = {
    client: {
      accessKeyId: process.env.ALC_ACCESS_KEY || '',
      accessKeySecret: process.env.ALC_SECRET_KEY || '',
      bucket: 'strive-lego-server',
      endpoint: 'oss-cn-beijing.aliyuncs.com'
    }
  }

  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig
  }
}
