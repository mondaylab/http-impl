/**
 * @description 文件压缩
 */

/**
 * http协议规定，客户端支持的编码格式由Accept-Encodng指定。
 * 最新的Chrome浏览器下，访问网页的请求头中的Accept-Encoding字段有三个值，
 * 表示支持三种格式，分别是gzip、deflate和br。
 * gzip、deflate 和 br 是三种不同的压缩算法，其中 gzip 和 deflate 是同一种格式（gzip）的两种不同算法实现，
 * 而 br 则是使用 Brotli 算法的压缩格式。Node.js 的内置模块 zlib 对这三种算法都能支持。
 */

/**
 *zlib 库是 Node 内置的强大的压缩/解压库，用它来压缩或解压数据都很方便。
 因为 Node.js 基于 v8，而 v8 也是 Chrome 浏览器的 JS 引擎，
 所以我们只需要在服务器对数据进行压缩即可，解压会由浏览器自动完成。
 当然，其它浏览器也会自动解压文件，只是算法不同而已。
 */
const zlib = require('zlib');

const server = http.createServer((req, res) => {
  let filePath = path.resolve(
    __dirname,
    path.join('www', url.fileURLToPath(`file:///${req.url}`))
  );

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath);
      const stats = fs.statSync(filePath);
      const timeStamp = req.headers['if-modified-since'];
      let status = 200;
      if (timeStamp && Number(timeStamp) === stats.mtimeMs) {
        status = 304;
      }
      res.writeHead(status, {
        'Content-Type': mime.getType(ext),
        'Cache-Control': 'max-age=86400', // 缓存一天
        'Last-Modified': stats.mtimeMs
        // 'Content-Encoding': 'deflate' // 告诉浏览器该文件是用deflate算法压缩的
      });

      /**
       * 一般来说，我们对HTML、JS、CSS这样的资源文件启用压缩，而图片、音频、视频等格式
       * 因通常已经经过了压缩，再启用压缩意义不大，还可能适得其反。
       * 所以我们可以根据MIMEtype判断一下，只对text、application类型启用压缩。
       */
      /**
       * 值得注意的是，不同的客户端所支持的压缩算法不同，
       * 所以，我们需要根据客户端的Accept-Encoding请求头字段实现多种压缩算法。
       */
      const acceptEncoding = req.headers['accept-encoding'];
      const compress = acceptEncoding && /^(text|application)\//.text(mimeType);
      if (compress) {
        // 返回客户端支持的一种压缩方式
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          if (encoding === 'gzip') {
            responseHeaders['Content-Encoding'] = 'gzip';
            return true;
          }
          if (encoding === 'deflate') {
            responseHeaders['Content-Encoding'] = 'deflate';
            return true;
          }
          if (encoding === 'br') {
            responseHeaders['Content-Encoding'] = 'br';
            return true;
          }
          return false;
        });
      }
      const compressionEncoding = responseHeaders['Content-Encoding']; // 获取选中的压缩方式
      res.writeHead(status, responseHeaders);
      if (status === 200) {
        const fileStream = fs.createReadStream(filePath);
        if (compress && compressionEncoding) {
          let comp;

          // 使用指定的压缩方式压缩文件
          if (compressionEncoding === 'gzip') {
            comp = zlib.createGzip();
          } else if (compressionEncoding === 'deflate') {
            comp = zlib.createDeflate();
          } else {
            comp = zlib.createBrotliDecompress();
          }
          /**
           * zlib提供了createDeflate()、createGZip()和createBrotliComporess()等方法，
           * 这些方法会返回流对象，所以只需要用pipe方法将这个对象和fileStream以及res连接起来即可。
           * 这样，我们请求的时候，返回的内容就都是经过压缩的了。
           * 同时，我们还要记得设置一个 Content-Encoding 响应头，告诉浏览器这个数据内容是经过压缩的。
           * Content-Encoding响应头的值是对应的压缩算法名，那么浏览器就会调用相应的解压算法来对资源进行解压了。
           */
          fileStream.pipe(zlib.createDeflate(comp)).pipe(res);
        } else {
          fileStream.pipe(res);
        }
      } else {
        res.end();
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});

/**
 * 总结：
 * 浏览器支持 gzip、deflate 和 br 这三种压缩算法，使用它们压缩文件，
 * 能够大大节省传输带宽，提升请求的响应速度，减少页面访问的延迟。
 */
