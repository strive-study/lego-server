import { EggPlugin } from 'egg'

const plugin: EggPlugin = {
  tegg: {
    enable: true,
    package: '@eggjs/tegg-plugin'
  },
  teggConfig: {
    enable: true,
    package: '@eggjs/tegg-config'
  },
  teggController: {
    enable: true,
    package: '@eggjs/tegg-controller-plugin'
  },
  teggSchedule: {
    enable: true,
    package: '@eggjs/tegg-schedule-plugin'
  },
  eventbusModule: {
    enable: true,
    package: '@eggjs/tegg-eventbus-plugin'
  },
  aopModule: {
    enable: true,
    package: '@eggjs/tegg-aop-plugin'
  },
  tracer: {
    enable: true,
    package: 'egg-tracer'
  },
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks'
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose'
  },
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  bcrypt: {
    enable: true,
    package: 'egg-bcrypt'
  }
}

export default plugin
