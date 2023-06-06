import { Controller } from 'egg'
import sharp from 'sharp'
import { parse, join } from 'path'

export default class UtilsController extends Controller {
  async fileLocalUpload() {
    const { ctx, app } = this
    const { filepath } = ctx.request.files[0]
    const imageSource = sharp(filepath)
    let thumbnailUrl = ''
    // 大于300 转换
    const metaData = await imageSource.metadata()
    if (metaData.width && metaData.width > 300) {
      const { name, ext, dir } = parse(filepath)
      app.logger.debug(name, ext, dir)
      const thumbnailPath = join(dir, `${name}-thumbnail${ext}`)
      console.log('thumbnailPath', thumbnailPath)
      // 保存新文件名
      await imageSource.resize({ width: 300 }).toFile(thumbnailPath)
      console.log('app.config.baseDir', app.config.baseDir)
      thumbnailUrl = thumbnailPath
        .replace(app.config.baseDir, app.config.baseUrl)
        .replace(/\\/g, '/')
      console.log()
    }

    app.logger.debug(metaData)
    let url = filepath
      .replace(app.config.baseDir, app.config.baseUrl)
      .replace(/\\/g, '/')
    ctx.helper.success({
      ctx,
      res: {
        url,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl : url
      }
    })
  }
}
