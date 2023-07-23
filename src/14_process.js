/**
 * @description 测试多进程
 */
const { Server } = require('../server/lib/interceptor');

const app = new Server({ instances: 0, mode: 'development' }); // 创建一个基于CPU内核数的多进程服务

// 测试多进程
app.use(async (ctx, next) => {
  console.log(`visit ${ctx.req.url} through worker: ${app.worker.process.pid}`);
  await next();
});

/**
 * 统计HTTP请求次数的拦截切面
 * Node.js 提供的process.send方法允许我们在进程间传递消息，
 * 比如worker.on('message', callback)可以让子进程监听接收到的消息。
 * 这样，我们就可以在主进程中监听子进程发送的消息。
 */
app.use(async (ctx, next) => {
  process.send('count');
  await next();
});

let count = 0;
// 处理由worker.send发来的消息
process.on('message', (msg) => {
  // 如果是count事件，则将count加一
  if (msg === 'count') {
    console.log('visit count: %d', ++count);
  }
});

app.listen({
  port: 9091,
  host: '0.0.0.0'
});

/**
 * 总结，多进程有三个优点：
 * ①能够充分利用计算机的 多核CPU 来处理用户的请求，提高服务器的响应速度；
 * ②如果其中某个子进程挂了，服务器可以通过主进程重新启动一个子进程，增加了系统的稳定性；
 * ③我们可以利用第二个优点在开发过程中实现文件的热更新，提高开发的效率。
 */
