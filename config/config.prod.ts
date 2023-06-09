import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.baseUrl = 'http://117.50.177.179:7001'
  // TODO 为 mongoDB 和 redis 添加密码
  config.mongoose = {
    url: 'mongodb://lego-mongo:27017/lego',
    options: {
      user: process.env.MONGO_DB_USERNAME,
      pass: process.env.MONGO_DB_PASSWORD
    }
  }

  config.redis = {
    client: {
      port: 6379,
      host: 'lego-redis',
      password: process.env.REDIS_PASSWORD,
      db: 0
    }
  }

  // 配置CORS允许域名
  config.security = {
    domainWhiteList: ['http://117.50.177.179:8080']
  }

  // 配置 JWT 过期时间
  config.jwtExpires = '2 days'

  // TODO 本地URL替换
  config.giteeOauthConfig = {
    redirectURL: 'http://117.50.177.179:7001/api/users/passport/gitee/callback'
  }

  // nginx rewrite
  config.H5BaseURL = 'http://117.50.177.179:7001'
  return config
}
