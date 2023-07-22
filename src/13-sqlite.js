const path = require('path');
const sqLite3 = require('sqlite3');
const { open } = require('sqlite');
const { Server, Router } = require('../server/lib/interceptor'); // 这里我们将 server 和 router 都规划到 interceptor包中

const dbFile = path.resolve(__dirname, '../database/todolist.db'); // todolist.db是sqlite数据库文件
let db = null;

const app = new Server(); // 创建 HTTP 服务器
const router = new Router(); // 创建路由中间件

/**
 * 在这个web服务中，我们一共创建了4个拦截切面：
 * 第一个切面是打印每次请求的日志；
 * 第二个切面是创建SQLite数据连接，每次请求都通过这个切面获得数据库实例；
 * 第三个切面是处理 /list 请求，返回任务数据；
 * 第四个切面是其他路径请求返回404。
 */
app.use(async ({ req }, next) => {
  console.log(`${req.method} ${req.url}`); // eslint-disable-line no-console
  await next();
});

app.use(async (ctx, next) => {
  if (!db) {
    // 如果数据库未连接，就创建一个
    /**
     * open方法创建 SQLite 数据库连接，成功后返回数据实例对象，然后，
     * 我们将这个数据实例缓存起来，即保存在db变量。
     * 这样，除了第一次请求，后续的请求都不需要再创建数据库连接。
     * 最后，我们将数据库实例保存到ctx对象的database属性里，
     * 以方便后续的切面使用该实例操作数据库。
     */
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
  router.get('/list', async (ctx, next) => {
    const { database, res } = ctx;
    res.setHeader('Content-Type', 'application/json');
    const { getList } = require('../server/model/todolist');
    const result = await getList(database); // 获取任务数据
    res.body = { data: result };
    await next();
  })
);

app.use(
  router.post('/add', async ({ database, params, res }, next) => {
    res.setHeader('Content-Type', 'application/json');
    const { addTask } = require('../server/model/todolist');
    const result = await addTask(database, params);
    res.body = result;
    await next();
  })
);

/**
 * 如果路径不是/list，则返回'<h1>Not Found</h1>'文本
 */
app.use(
  router.all('.*', async ({ params, req, res }, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.body = '<h1>Not Found</h1>';
    res.statusCode = 404;
    await next();
  })
);

app.listen({
  port: 9091,
  host: '0.0.0.0'
});
