import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1685372774890_3274'

  // add your egg config in here
  // config.middleware = ['myLogger']
  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    baseUrl: 'default.url',
    mongoose: {
      url: 'mongodb://localhost:27017/lego'
    },
    myLogger: {
      allowedMethod: ['POST', 'GET']
    }
  }

  config.security = {
    csrf: {
      enable: false
    }
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
  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig
  }
}
