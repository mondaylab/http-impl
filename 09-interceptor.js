/**
 * @description 拦截器与动态路由
 */
/**
 * 静态HTTP服务：指不需要任何业务逻辑处理的，直接返回与请求URL对应的文件（这里的文件包括了图片、音频、视频、html文件等等）。
 * 动态HTTP服务：指需要根据不同的请求信息（如路径、query等），将请求分配给不同的模块进行相应的业务逻辑处理，然后将结果返回给客户端。
 */

/**
 * 目前比较流行的 Node.js HTTP 服务框架的架构采用了拦截器模式，这种模式将 HTTP 请求响应的过程分为若干切面，
 * 每个切面上进行一项或若干项关联的操作。比如说，我们可以通过不同的拦截切面处理用户信息验证、会话（session）验证、
 * 表单数据验证、query 解析，或者业务逻辑处理等等。这种架构设计让切面与切面之间彼此独立，有其可取之处。
 */

/**
 * 目标：
 * 运用函数式编程的思想，实现能够注册多个拦截切面的函数，
 * 并将这些拦截切面包装成一个异步的洋葱模型的拦截器框架。
 * 解读：
 * use方法将拦截切面存入 aspects 数组。run方法通过数组的 reduceRight
 * 方法迭代 aspects 数组，将所有注册的拦截切面拼接成异步调用嵌套的洋葱模式并执行它。
 */
class Interceptor {
  constructor() {
    this.aspects = []; // 用于存储拦截切面
  }
  use(/* async */ functor) {
    // 注册拦截切面
    this.aspects.push(functor);
    return this;
  }

  async run(context) {
    // 执行注册的拦截切面
    const aspects = this.aspects;

    // 将注册的拦截切面包装成一个洋葱模型
    const proc = aspects.reduceRight(
      function (a, b) {
        // eslint-disable-line
        return async () => {
          await b(context, a);
        };
      },
      () => Promise.resolve()
    );

    try {
      await proc(); // 从外到里执行这个洋葱模型
    } catch (ex) {
      console.error(ex.message);
    }

    return context;
  }
}

module.exports = Interceptor;

/**
 * @description 例子使用🌰
 */
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const inter = new Interceptor();

const task = function (id) {
  return async (ctx, next) => {
    try {
      console.log(`task ${id} begin`);
      ctx.count++;
      await wait(100);
      console.log(`count: ${ctx.count}`);
      await next();
      console.log(`task ${id} end`);
    } catch (ex) {
      throw new Error(ex);
    }
  };
};

// 将多个任务以拦截切面的方式注册到拦截器中
inter.use(task(0));
inter.use(task(1));
inter.use(task(2));
inter.use(task(3));
inter.use(task(4));

// 从外到里依次执行拦截切面
inter.run({ count: 0 });
