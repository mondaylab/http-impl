/**
 * @description 使用router来请求mock的数据
 */

const Router = require('./lib/router');
const Server = require('./lib/server');
const param = require('./aspect/param');
const fs = require('fs');

const app = new Server();
const router = new Router();

app.listen({
  port: 9091,
  host: '0.0.0.0'
});

/**
 * 一共配置了5个拦截切面：
 * ①第一个拦截切面是提供log，这样我们在服务器的控制台上，就能知道用户访问了哪个URL。
 * ②第二个拦截切面是前面实现的解析GET参数的拦截切面，每一个请求都会经过这个切面以获得URL中的query对象。
 * ③接着是两个路由由/coronavirus/index 和 /coronavirus/:date，对应获取有疫情记录的日期和
 * 某个日期各国疫情数据这两个API。
 * ④最后是默认的路由，返回404。
 */

app.use(({ req }, next) => {
  console.log(`${req.method}${req.url}`);
  next();
});

app.use(param);

app.use(
  router.get('/coronavirus/index', async ({ route, res }, next) => {
    const { getCoronavirusKeyIndex } = require('./lib/module/mock');
    const index = getCoronavirusKeyIndex();

    /**
     * 下面这段代码表示：
     * 当我们访问路径名为'/coronavirus/index'的时候，执行服务端渲染的拦截切面。
     * 这个切面实现了将数据（index）与我们自定义的模板文件相结合，生成HTML格式的数据，
     * 并返回给浏览器的功能。
     *
     * 其中handlebars.compile(tpl)这个方法根据模板语法编译模板文件，编译后返回一个函数（template）。
     * 然后通过调用这个函数template({data: index})，将模板里的变量用我们的给定的数据替换。
     */

    const handlebars = require('handlebars');

    // 获取模板文件
    const tpl = fs.readFileSync('./view/coronavirus_index.html', {
      encoding: 'utf-8'
    });

    // 编译模板
    const template = handlebars.compile(tpl);

    console.log(template, 'template');

    // 将数据和模板结合
    const result = template({ data: index });
    res.setHeader('Content-Type', 'text/html');
    res.body = result;
    await next();
  })
);

app.use(
  router.get('/coronavirus/:date', async ({ params, route, res }, next) => {
    const { getCoronavirusByDate } = require('./lib/module/mock');
    const data = getCoronavirusByDate(route.date);

    /**
     * 增加一个简单的query参数type，当type=json的时候，
     * 我们仍然让页面返回 JSON 数据，这样便于我们开发调试。
     */
    if (params.type === 'json') {
      res.setHeader('Content-Type', 'application/json');
      // 客户端渲染 → 服务器返回json数据，然后用js渲染
      res.body = { data };
    } else {
      const handlebars = require('handlebars');
      const tpl = fs.readFileSync('./view/coronavirus_date.html', {
        encoding: 'utf-8'
      });

      const template = handlebars.compile(tpl);
      const result = template({ data });

      res.setHeader('Content-Type', 'text/html');

      // 服务端渲染 → 返回html
      res.body = result;
    }

    await next();
  })
);

app.use(
  router.all('.*', async ({ params, req, res }, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.body = '<h1>Not Found, mondaylab</h1>';
    res.statusCode = 404;
    await next();
  })
);
