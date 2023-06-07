import { parse, join, extname } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Controller, FileStream } from 'egg'
import sharp from 'sharp'
import { nanoid } from 'nanoid'
import sendToWormhole from 'stream-wormhole'
import Busboy from 'busboy'
export default class UtilsController extends Controller {
  /**
   * 上传文件到OSS
   */
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

  /**
   * multipart 上传多个文件到阿里云
   */
  async uploadMultipleFiles() {
    const { ctx, app } = this
    const parts = ctx.multipart()
    // const part1 = await parts()
    // app.logger.info('part1', part1)
    // const part2 = await parts()
    // app.logger.info('part2', part2)

    const urls: string[] = []
    // 可读流
    let part: FileStream | string[]
    while ((part = await parts())) {
      // 非文件 不处理
      if (Array.isArray(part)) {
        app.logger.info(part)
      } else {
        try {
          const savedOssPath = this.pathToUrl(
            join('xiaoli', nanoid(6) + extname(part.filename))
          )

          const result = await ctx.oss.put(savedOssPath, part)
          const { url } = result
          urls.push(url)
        } catch (error) {
          await sendToWormhole(part)
          ctx.helper.error({ ctx, errorType: 'imageUploadFail' })
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } })
  }

  /**
   * promise封装busboy 上传多个文件
   */
  uploadFilesUseBusboy() {
    const { ctx, app } = this
    return new Promise<string[]>(resolve => {
      const results: string[] = []
      const busboy = Busboy({ headers: ctx.req.headers })
      busboy.on('file', (fieldname, file, fileInfo) => {
        app.logger.info(fieldname, file, fileInfo)
        const uid = nanoid(6)
        const savedFilePath = join(
          app.config.baseDir,
          'uploads',
          uid + extname(fileInfo.filename)
        )
        file.pipe(createWriteStream(savedFilePath))
        file.on('end', () => {
          results.push(savedFilePath)
        })
      })
      busboy.on('field', (fieldname, val) => {
        app.logger.info(fieldname, val)
      })
      busboy.on('finish', () => {
        app.logger.info('finished')
        resolve(results)
      })
      ctx.req.pipe(busboy)
    })
  }
  /**
   * busboy测试
   */
  async testBusboy() {
    const { ctx } = this
    const results = await this.uploadFilesUseBusboy()
    ctx.helper.success({ ctx, res: results })
  }
  /**
   * file模式上传文件到本地
   */
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

  /**
   * stream模式上传文件到本地
   */
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
