const http = require('http');
const Interceptor = require('../09-interceptor');

module.exports = class {
  constructor() {
    const interceptor = new Interceptor();

    this.server = http.createServer(async (req, res) => {
      await interceptor.run({ req, res }); // 执行注册的拦截函数
      if (!res.writableFinished) {
        let body = res.body || '200 OK';
        if (body.pipe) {
          body.pipe(res);
        } else {
          if (
            typeof body !== 'string' &&
            res.getHeader('Content-Type') === 'application/json'
          ) {
            body = JSON.stringify(body);
          }
          res.end(body);
        }
      }
    });

    this.server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    this.interceptor = interceptor;
  }

  listen(opts, cb = () => {}) {
    if (typeof opts === 'number') opts = { port: opts };
    opts.host = opts.host || '0.0.0.0';
    console.log(`Starting up http-server
        http://${opts.host}:${opts.port}
    `);
    this.server.listen(opts, () => cb(this.server));
  }

  use(aspects) {
    // 向http服务器添加不同功能的拦截切面
    return this.interceptor.use(aspects);
  }
};
