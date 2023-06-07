import { parse, join, extname } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Controller } from 'egg'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import sendToWormhole from 'stream-wormhole'

export default class UtilsController extends Controller {
  async uploadToOss() {
    const { ctx, app } = this
    const stream = await this.ctx.getFileStream()
    const savedOssPath = this.pathToUrl(
      join('xiaoli', nanoid(6) + extname(stream.filename))
    )
    try {
      const result = await ctx.oss.put(savedOssPath, stream)
      const { name, url } = result
      app.logger.info(result)
      ctx.helper.success({
        ctx,
        res: {
          name,
          url
        }
      })
    } catch (error) {
      await sendToWormhole(stream)
      ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
  }
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
      thumbnailUrl = this.pathToUrl(thumbnailPath)
      console.log()
    }

    app.logger.debug(metaData)
    let url = this.pathToUrl(filepath)
    ctx.helper.success({
      ctx,
      res: {
        url,
        thumbnailUrl: thumbnailUrl ? thumbnailUrl : url
      }
    })
  }

  async fileUploadByStream() {
    const { ctx, app } = this
    const stream = await this.ctx.getFileStream() //可读流
    const uid = nanoid(6)
    const savedFilePath = join(
      app.config.baseDir,
      'uploads',
      uid + extname(stream.filename)
    )
    const savedThumbnailPath = join(
      app.config.baseDir,
      'uploads',
      uid + '_thumbnail' + extname(stream.filename)
    )
    const target = createWriteStream(savedFilePath)
    const target2 = createWriteStream(savedThumbnailPath)
    const savePromise = pipeline(stream, target)
    const transformer = sharp().resize({ width: 300 }) // 转换流
    const thumbnailPromise = pipeline(stream, transformer, target2)
    try {
      await Promise.all([savePromise, thumbnailPromise])
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
    }
    ctx.helper.success({
      ctx,
      res: {
        url: this.pathToUrl(savedFilePath),
        thumbnailUrl: this.pathToUrl(savedThumbnailPath)
      }
    })
  }

  pathToUrl(path: string) {
    const { app } = this
    return path
      .replace(app.config.baseDir, app.config.baseUrl)
      .replace(/\\/g, '/')
  }
}
