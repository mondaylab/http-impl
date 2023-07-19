const http = require('http');
const url = require('url');

const responseData = {
  ID: 'zhangsan',
  Name: '张三',
  RegisterData: '2023.07.09'
};

function HTML(data) {
  return `
        <ul>
            <li><span>账号：</span><span>${data.ID}</span></li>
            <li><span>昵称：</span><span>${data.Name}</span></li>
            <li><span>注册时间：</span><span>${data.RegisterDate}</span></li>
        </ul>
    `;
}

/**
 * 通过req.headers.accept读取请求头accept字段的信息，如果这个信息中包含有application/json，
 * 表示发起这个请求的客户端支持json格式的内容，服务器就返回JSON格式的结果，否则返回HTML的结果。
 *
 * 浏览器默认发送的 HTTP 请求中，accept 字段的值是
 * text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*
 *  /*;q=0.8,application/signed-exchange;v=b3;q=0.9，不包括appliaction/json
 */
/**
 * GET 表示从服务器获取 URL 指定的资源。
 * HEAD 表示只获取该 URL 指定资源的 HTTP 响应头部分（忽略 Body）。
 * OPTIONS 是一个特殊的请求，用来预检服务器是否支持某个请求动作。比如客户端可以先发起一个请求询问服务器是否支持 PUT 请求。若支持，则发起后续的 PUT 请求。
 * POST 表示将数据资源从客户端提交给服务器。
 * PUT 表示更新服务器上某个已有资源。
 * PATCH 也表示更新服务器上某个已有资源，但以增量更新的方式，客户端只传输修改部分。
 * DELETE 表示从服务器上删除某个资源。
 * GET、HEAD、POST 请求是 HTTP/1.0 就支持的请求动作，OPTIONS、PUT、PATCH、DELETE 是 HTTP/1.1 增加的请求动作。
 */
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(`http://${req.headers.host}${req.url}`);
  if (pathname === '/') {
    const accept = req.headers.accept; // 获取accept信息
    if (accept.indexOf('application/json') >= 0) {
      res.writeHead(200, { 'Cotnent-Type': 'application/json' });
      res.end(JSON.stringify(responseData));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(toHTML(responseData));
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
