const net = require('net');

/**
 *
 * 第一行：HTTP协议的返回内容
 * 第二行：
 * 一直到空行前面，和请求的报文一样是键/值形式的字符串，表示HTTP响应头。
 * Content-Type：指定了相应类型，这里会text/html，告诉浏览器这个返回内容是一段html，要去解析其中的html标签
 * Content-Length：指定了相应内容中 HTTP Body的字符数。当浏览器读到Content-length指定的字符数后，就会认为响应的内容已传输完成。
 * Connection:: keep-alive 告诉浏览器可以不断开TCP连接，直到网页关闭。
 *              这是 HTTP/1.1 中支持的机制，在同一个会话期间能够复用 TCP 连接，以免每次请求的时候都要创建一个新的 TCP 连接，那样会比较耗性能。
 * Date：用来存放服务器响应请求的日期时间。这个可以提供给页面，方便页面获取服务器时间，对于一些时间依赖的应用（比如秒杀购物）比较有用。
 * 响应头之后是一个空行，这个也是HTTP Header和HTTP Body的分隔。
 *
 *
 */
function responseData(str) {
  return `HTTP/1.1 200 OK
            Connection: keep-alive
            Date: ${new Date()}
            Content-Length: ${str.length}
            Content-Type: text/html

    ${str}`;
}

/**
 * net.createServer表示常见病返回一个server对象
 * 它的参数是一个回调函数，这个回调函数会在连接建立的时候被调用
 */
const server = net
  .createServer((socket) => {
    socket.on('data', (data) => {
      /**
       * 如果请求的数据以 GET/HTTP 开头
       * 就返回给请求的客户端（即浏览器）一段文本
       * 这段文本通过模板字符串定义在responseData函数里
       */
      const matched = data.toString('utf-8').match(/^GET ([/\w]+) HTTP/);
      if (matched) {
        const path = matched[1];
        if (path === '/') {
          // 如果路径是‘/’，返回hello world，状态是200
          socket.write(responseData('<h1>Hello World</h1>'));
        } else {
          // 否则返回404状态
          socket.write(responseData('<h1>Not Found</h1>', 404, 'NOT FOUND'));
        }
      }
      console.log(`DATA:\n\n${data}`);
    });
    // 关闭网页的时候，会弹出这个
    socket.on('close', () => {
      console.log('connection closed, goodbye!\n\n\n');
    });
  })
  .on('error', (err) => {
    throw err;
  });

/**
 * net.createServer创建的server对象需要调用listening方法才能够与客户端建立连接
 * listen方法的第一个参数是一个配置项，host表示校验服务器或IP地址
 * 如果设置为0.0.0.0，则表示不校验名称及IP地址。
 * 也就是说只要能访问到运行tcp-server.js的这台服务器，不管是通过哪个 IP 地址或者服务器名访问的，都允许建立连接。
 *
 */
server.listen(
  {
    host: '0.0.0.0',
    port: 8080 // port 表示要连接的端口号
  },
  () => {
    console.log('opened server on', server.address());
  }
);
