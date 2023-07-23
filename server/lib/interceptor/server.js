const http = require('http');
const cluster = require('cluster');
const cpuNums = require('os').cpus().length; // 获得CPU的内核数
const Interceptor = require('./interceptor');

module.exports = class {
  constructor({
    instances = 1,
    enableCluster = true,
    mode = 'production'
  } = {}) {
    if (mode === 'development') {
      instances = 1; // 在开发模式下，为了提高开发速度，只启动一个worker进程
      enableCluster = true;
    }
    this.mode = mode; // production/development
    this.instances = instances || cpuNums; // 指定启动几个进程，默认启动和CPU内核数一样多的进程
    this.enableCluster = enableCluster; // 表示是否启动多进程模式，默认为多进程模式
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
    const instances = this.instances;

    /**
     * 将server模块改造成支持多进程模式
     * 依靠cluster.isMaster来判断当前进程是主进程还是子进程
     * 在 Cluster 多进程模型中，有一个主进程被称为 Master，其他若干个子进程被称为 Worker。
     * Cluster 通过 Master 管理 Worker。
     */

    // 如果是主进程，创建instance个子进程
    if (this.enableCluster && cluster.isMaster) {
      for (let i = 0; i < instances; i++) {
        cluster.fork(); // 创建子进程
      }

      /**
       * 当主进程接收到消息后，将消息通过 broadcast方法广播给其它子进程，
       * broadcast方法通过worker.send方法将消息发送到自己的进程中去处理。
       */
      function broadcast(message) {
        Object.entries(cluster.workers).forEach(([id, worker]) => {
          worker.send(message);
        });
      }

      // 广播消息
      Object.keys(cluster.workers).forEach(([id, worker]) => {
        /**
         * 在主进程中我们通过遍历 cluster.workers，可以访问各个子进程对象（Worker)，
         * 然后我们为每个子进程添加 on message 事件监听器。
         * 这样一来，每个子进程就能通过主进程监听来自process.send方法的消息了。
         */
        process.on('message', broadcast);
      });

      /**
       * 如果是开发模式，监听js文件是否修改：
       * 如果文件有变化，则杀死所有子进程（即worker进程），并重新启动一个新的子进程。
       */
      if (this.mode === 'development') {
        require('fs').watch('.', { recursive: true }, (eventType) => {
          // 监听js文件是否更新，如果更新了
          if (eventType === 'change') {
            Object.entries(cluster.workers).forEach(([id, worker]) => {
              console.log('kill worker %d', id);
              worker.kill();
            });
            cluster.fork();
          }
        });
      } else {
        // 如果在production模式下，则不能热更新
        // 主进程监听exit事件，如果发现有某个子进程停止了，那么重新创建一个子进程
        cluster.on('exit', (worker, code, signal) => {
          console.log(
            'worker %d died (%s). restarting…',
            worker.process.pid,
            signal || code
          );
          cluster.fork();
        });
      }
    } else {
      // 如果当前进程是子进程
      this.worker = cluster.worker;
      console.log(`Starting up http-server
          http://${opts.host}:${opts.port}
      `);
      this.server.listen(opts, () => cb(this.server));
    }
  }

  use(aspects) {
    // 向http服务器添加不同功能的拦截切面
    return this.interceptor.use(aspects);
  }
};
