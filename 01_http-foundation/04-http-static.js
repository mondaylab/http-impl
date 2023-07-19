/**
 * @description 用http模块实现一个静态服务
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

/**
 * 需求：读取资源文件并返回。
 * 根据需求，静态文件服务器主要包含3个内容：
 * ①解析请求路径
 * ②读取请求的文件
 * ③返回文件内容
 */
const server = http.createServer((req, res) => {
  /**
   * 第一步：通过 url.fileURLToPath 方法讲req.url解析成文件路径
   *      然后用path.join将相对路径www和文件路径拼起来，
   *      最后通过path.resolve(__dirname, 相对路径)得到文件的绝对路径filePath
   */
  let filePath = path.resolve(
    __dirname,
    path.join('www', url.fileURLToPath(`file:/${req.url}`))
  ); // 解析请求的路径

  /**
   * 第二步：根据filePath，使用fs.existsSync()判断文件是否存在。
   * 这时的filePath有两种情况，一种情况直接是文件，例如我们访问http://localhost:8080/index.html，这样的话这里的filePath对应到的直接是文件。
   * 另一种情况是我们省略文件，访问http://localhost:8080/。按照 HTTP 服务的 URL 约定，这时候相当于访问了这个路径下的index.html文件。
   * 所以我们要判断当前的filePath究竟是文件还是目录，如果是目录，我们还要再 join 一次，变成 index.html 文件。
   */
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);

    /**
     * 浏览器可以处理多种格式的媒体文件，遵循的标准叫做 MIME。
     * 浏览器的请求头中的 Accept 字段包含该请求期望的 MIME type，可以有多个，以逗号分隔。
     * 详情戳链接：https://juejin.cn/book/7133100888566005763/section/7133186546181603340?enter_from=course_center&utm_source=course_center
     */
    // const { ext } = path.parse(filePath);
    // if (ext === '.png') {
    //   res.writeHead(200, { 'Content-Type': 'image/png' });
    // } else {
    //   res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    // }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath);
      // 直接使用mime.getType(ext)就能处理所有请求体中需要的文件类型了
      /**
       * 这种方式只适用于小文件，
       * 如果处理大文件，比如大的图片或者音频视频文件等，这么操作会有两类问题。
       * 其一是会需要很长时间的读文件操作，造成 I/O 瓶颈，使得客户端需要等待良久才能得到响应。
       * 其二是要把大量数据读入内存，然后返回，也造成很大的内存开销。这显然是不合适的。
       * 要解决这个问题，更好的方式是使用流式Stream处理。
       */
      res.writeHead(200, { 'Content-Type': mime.getType(ext) });

      /**
       * 将文件内容返回给客户端浏览器，第一个办法👇🏻
       */
      //   const content = fs.readFileSync(filePath); // 读取文件内容
      //   return res.end(content); // 返回文件内容

      /**
       * 将文件内容返回给客户端浏览器，第二个办法👇🏻
       * 我们的文件内容通过fs.createReadStream以流的方式读取，然后通过pipe方法输送到res即响应流对象中。
       * 这里，Response 对象内部会处理从 fileStream 收到的数据，把接收的数据不断地发送给客户端浏览器，
       * 而不是像前面的实现方式那样要等待整个文件的内容完全读出来再发送。这样就可以避免文件内容太大时，内存的消耗以及文件 I/O 导致的阻塞了。
       * 关于stream的应用: https://juejin.cn/post/6844903891083984910#heading-11
       */
      const fileStream = fs.createReadStream(filePath); // 以流的方式读取文件内容
      fileStream.pipe(res); // pipe方法可以将两个流连接起来，这样数据就会从上流流向下游
    }
  }
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>Not Found</h1>');
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8080, () => {
  console.log('opened server on', server.address());
});
