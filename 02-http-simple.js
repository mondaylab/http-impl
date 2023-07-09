const http = require('http');
const url = require('url');

/**
 * 相比使用 TCP 服务来处理 HTTP 请求，使用 http 服务处理 HTTP 请求更加简单，
 * 因为我们不需要手动解析 HTTP 请求的报文，以及用字符串模板组织 HTTP 响应报文。
 *
 * http.createServer用来创建一个HTTP服务，它的回调中有两个参数：req表示http请求对象，res表示http响应对象。
 * 可以从req对象中获取请求相关的信息，比如：①req.header是http请求头的内容；
 * ②req.url是当前请求的URL路径；③req.headers.host 获取请求的服务名；
 *
 * 为什么http协议要分为header和body？实际上http请求的这种设计提供了一种内容协商机制。
 * 内容协商是http协议的基本原则，服务器根据不同的请求头，对指向同一URL的请求提供不同格式的响应内容。
 */
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(`http://${req.headers.host}${req.url}`);
  // 根据不同的情况返回200或404
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello world</h1>');
  } else {
    // 用res.writeHead来写入其他http响应头
    res.writeHead(404, { 'Content-Type': 'text/html' });
    /**
     * 用res.end来写入http的body部分
     * 当res.end被执行时，HTTP请求的响应就会被发回给浏览器
     */
    res.end('<h1>Not Found</h1>');
  }
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(8080, () => {
  console.log('opened server on', server.address());
});
