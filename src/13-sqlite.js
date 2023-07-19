const path = require('path');
const sqLite3 = require('sqlite3');
const { open } = require('sqlite');
const { Server, Router } = require('../server/lib/interceptor'); // 这里我们将 server 和 router 都规划到 interceptor包中

const dbFile = path.resolve(__dirname, '../database/todolist.db'); // todolist.db是sqlite数据库文件
let db = null;

const app = new Server(); // 创建 HTTP 服务器
const router = new Router(); // 创建路由中间件

app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`); // eslint-disable-line no-console
  await next();
});

app.use(async (ctx, next) => {
  if (!db) {
    // 如果数据库未连接，就创建一个
    db = await open({
      filename: dbFile,
      driver: sqLite3.cached.Database
    });
  }
  ctx.database = db; // 将db挂在ctx上下文对象的database属性上

  await next();
});

/**
 * 如果请求的路径是 /list, 则从todo表中获取所有任务数据
 */
app.use(
  router.get('/list', async ({ database, route, res }, next) => {
    res.setHeader('Content-Type', 'application/json');
    const { getList } = require('./model/todolist');
  })
);
