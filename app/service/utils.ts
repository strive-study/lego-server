import { Service } from 'egg'
import { createSSRApp } from 'vue'
import LegoComponents from 'lego-components'
import { renderToString } from 'vue/server-renderer'

export default class UtilsService extends Service {
  async renderToPageData(query: { id: number; uuid: string }) {
    const work = await this.ctx.model.Work.findOne(query).lean()
    if (!work) {
      throw new Error('work not exist')
    }
    const { title, desc, content } = work
    this.px2Vw(content && content.components)
    const vueApp = createSSRApp({
      data() {
        return {
          components: (content && content.components) || []
        }
      },
      template: '<final-page :components="components"></final-page>'
    })
    vueApp.use(LegoComponents)
    const html = await renderToString(vueApp)
    const bodyStyle = this.propToStyle(content && content.props)
    return {
      html,
      title,
      desc,
      bodyStyle
    }
  }

  /**
   * props属性转body的内联样式
   * @param props
   * @returns
   */
  propToStyle(props = {}) {
    const keys = Object.keys(props)
    const styleArr = keys.map(key => {
      // fontSize -> font-size
      const formatKey = key.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`)
      const value = props[key]
      return `${formatKey}:${value}`
    })
    return styleArr.join(';')
  }

  px2Vw(components = []) {
    // 10px 9.5px
    const reg = /^(\d+(\.\d+)?)px$/
    components.forEach((c: any = {}) => {
      const props = c.props || {}
      // 遍历组件属性
      Object.keys(props).forEach(key => {
        const val = props[key]
        // 避免保存有问题
        if (typeof val !== 'string') {
          return
        }
        // 无px
        if (reg.test(val) === false) {
          return
        }
        const arr = val.match(reg) || []
        const numStr = arr[1]
        const num = parseFloat(numStr)
        // 计算vw 重新赋值 编辑器画布375
        const vwNum = (num / 375) * 100
        props[key] = `${vwNum.toFixed(2)}vw`
      })
    })
  }
}
