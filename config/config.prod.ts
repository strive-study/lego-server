import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.baseUrl = 'prod.url'
  // TODO 为 mongoDB 和 redis 添加密码
  // config.mongoose = {
  //   client: {
  //     url: 'xxx',
  //     options: {
  //       dbName: 'lego',
  //       user: 'xyz',
  //       pass: 'pass'
  //     }
  //   }
  // }

  // config.redis = {
  //   client: {
  //     port: 6379,
  //     host: '127.0.0.1',
  //     password: 'pass',
  //     db: 0
  //   }
  // }

  // 配置CORS允许域名
  config.security = {
    domainWhiteList: ['http://localhost:8080']
  }

  // 配置 JWT 过期时间
  config.jwtExpires = '2 days'

  // TODO 本地URL替换
  config.giteeOauthConfig!.redirectURL =
    'http://localhost:7001/api/users/passport/gitee/callback'
  // nginx rewrite
  config.H5BaseURL = 'http://localhost:7001'
  return config
}
