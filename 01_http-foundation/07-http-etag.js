const checksum = require('checksum');

const server = http.createServer((req, res) => {
  const srvUrl = url.parse(`http://${req.url}`);
  let path = srvUrl.path;
  if (path === '/') path = '/index.html';

  const resPath = `resource${path}`;

  if (!fs.existsSync(resPath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end('<h1>404 Not Found</h1>');
  }

  /**
   * 使用Etag实现协商缓存的思路，与使用Last-Modified类似，
   * 只是用文件内容的 checksum 校验代替文件信息中的stats.mtimeMs来判断文件内容是否被修改。
   */
  checksum.file(resPath, (err, sum) => {
    const resStream = fs.createReadStream(resPath);
    sum = `"${sum}"`; // etag 要加双引号

    if (req.headers['if-none-match'] === sum) {
      res.writeHead(304, {
        'Content-Type': getMimeType(resPath),
        etag: sum
      });
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Type': getMimeType(resPath),
        etag: sum
      });
      resStream.pipe(res);
    }
  });
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8080, () => {
  console.log('opened server on', server.address());
});

/**
 * http缓存总结：
 * 在 HTTP 协议中，只有 GET 和 OPTIONS 是支持缓存的。它有两种缓存策略，分别是强缓存和协商缓存。
 * 强缓存通过Cache-Control响应头设置。如果强缓存生效，浏览器不会向服务器发送请求，而是直接使用缓存的内容。
 * 但是如果资源是通过地址栏访问，或者强制刷新网页的时候，浏览器的请求头就会带有Cache-Control: no-cache和Pragma: no-cache，这会导致了服务器响应头的强缓存被浏览器忽略。
 *
 * 强缓存发生的条件比较严格，只有同时满足以下 3 个条件才会发生：
 * 两次请求的 url 完全相同（包括了 host、pathname、query）
 * 请求的动作是 GET 或者是 OPTIONS
 * 请求头不带有Cache-Control: no-cache和Pragma: no-cache这两个信息
 *
 * 如果通过地址栏直接访问的资源也能被浏览器缓存的话，我们需要进行协商缓存。协商缓存是通过Last-Modified或Etag响应头设置。
 * 如果协商缓存生效，浏览器仍然会发送请求，但是服务器会返回 304 响应，并且不会返回 Body 内容。
 * 如果浏览器被用户强制刷新，那么强缓存和协商缓存都会失效。
 * 因为强制刷新会带上 Cache-Control: no-cache 和 Pragma: no-cache 请求头且不会带上If-Modified-Scene和If-None-Match请求头。
 */
