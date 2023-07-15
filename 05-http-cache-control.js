/**
 * @description 用强缓存发起请求
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

/**
 * 如果是输入地址直接更新，会导致设置的缓存失效，直接触发了浏览器的强缓存。
 * 所以，在web应用更新的时候，应该主动去触发url才是。
 * 这个步骤在现代的web开发中，一般交给工程化脚本去解决。
 */
const server = http.createServer((req, res) => {
  let filePath = path.resolve(
    __dirname,
    path.join('www', url.fileURLToPath(`file:///${req.url}`))
  );

  console.log(filePath, 'filePath');

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (fs.existsSync(filePath)) {
      const { ext } = path.parse(filePath);
      res.writeHead(200, {
        'Content-Type': mime.getType(ext),
        'Cache-Control': 'max-age=86400' // 增加响应头，表示缓存一天
      });
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Not Found</h1>');
  }
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8080, () => {
  console.log('opened server on', server.address());
});
