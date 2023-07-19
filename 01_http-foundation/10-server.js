const Server = require('./lib/server');

const app = new Server();

// 添加拦截切面
app.use(async ({ res }, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.body = '<h1>Hello World</h1>';
  await next();
});

app.listen({
  port: 9091,
  host: '0.0.0.0'
});

/**
 * 拦截器的好处：
 * ①在实际业务处理中，拦截器是非常有用的。
 * ②比如，我们有一个业务需求：授权的用户提交申请表单，可以查看数据。
 * ②这时，我们可以将这个业务需求切分为3个切面：用户信息验证、表单信息验证、查询业务数据并返回。
 * ③如果用户信息验证的切面不能通过，那么后面2个切面就不会执行。
 * ④一个项目中，用户信息验证可能在很多业务逻辑中都用到，那么这个拦截切面还可以被共用，避免了代码的冗余。
 * ⑤所以拦截器的好处至少有两个：控制业务流程和复用功能模块。
 */
