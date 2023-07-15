const Router = require('./lib/router');
const Server = require('./lib/server');

const app = new Server();
const router = new Router();

app.listen({
  port: 9091,
  host: '0.0.0.0'
});

app.use(
  router.all('/test/:course/:lecture', async ({ route, res }, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.body = route;
    await next();
  })
);

// 添加一条默认路由
// 这条规则表示让未匹配到的 URL 走这个默认的路由，打印出<h1>Hello world</h1>
app.use(
  router.all('.*', async ({ req, res }, next) => {
    res.setHeader('Content-Type', 'text/html');
    res.body = '<h1>Hello World</h1>';
    await next();
  })
);

/**
 * 总结：
 * ①在动态服务器架构设计中，最基础的就是拦截器模块和路由模块。
 * ②拦截器可以注册多个拦截切面，各切面通过 next 方法联系，运行时依次异步执行每个拦截切面。
 * ③使用拦截器的优点在于，它可以将一个业务流程按照功能分为若干个切面，当其中一个切面执行失败时，
 * 它能够阻止后面的切面继续执行，起到了流程控制的作用。
 * 同时，每个功能切面还能被其他业务需求共享，降低了项目代码的冗余度。
 *
 * ④路由的目的是将不同的 HTTP 请求根据不同的 URL 路径分配给不同的业务处理模块。路由模块是一个中间件，可以自定义路由规则。
 * ⑤我们的例子中，HTTP 服务会根据 URL 的 pathname 匹配路由规则，执行命中规则中的拦截切面函数。
 */
