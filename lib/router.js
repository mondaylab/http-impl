/**
 * URL由几个部分组成：
 * protocol: // hostname:port / pathname ? query # hash
 *
 * 路由的实现思路：
 * 一个简单的路由是一个类，它的方法能够返回不同的拦截切面，这样的类叫做HTTP服务中间件（Middleware）。
 */

const path = require('path');
const url = require('url');

/**
 * @rule：路径规则
 * @pathname: 路径名
 */
function check(rule, pathname) {
  /**
   * 解析规则，比如：/test/:course/:lecture
   * paraMatched = ['/test/:course/:lecture', ':course', ':lecture']
   */
  const paraMatched = rule.match(/:[^/]+/g);
  const ruleExp = new RegExp(`${rule.replace(/:[^/]+/g, '([^/]+)')}`);

  /**
   * 解析真正的路径：比如：/test/123/abc
   * ruleMatched = ['/test/123/abs', '123', 'abs']
   */
  const ruleMatched = pathname.match(ruleExp);

  /**
   * 将规则和路径拼接为对象：
   * ret = {course: 123, lecture: abc}
   */
  if (ruleMatched) {
    const ret = {};
    if (paraMatched) {
      for (let i = 0; i < paraMatched.length; i++) {
        ret[paraMatched[i].slice(1)] = ruleMatched[i + 1];
      }
    }
    return ret;
  }
  return null;
}

/**
 * @method: GET/POST/PUT/DELETE
 * @rule: 路径规则，比如：test/:course/:lecture
 * @aspect: 拦截函数
 */
/**
 * 这里的route函数是一个高阶函数，它返回的函数作为拦截切面被添加到server的拦截器中。
 * check函数利用正则表达式检查真正的路径和路由规则是否匹配，如果命中规则，就返回解析后的规则对象，并将它写入到
 * ctx.route属性中去，然后route函数调用真正的切面（即：aspect函数）执行内容。
 * 如果没有名中国，则跳过这个拦截切面，执行下一个拦截切面。
 */
function route(method, rule, aspect) {
  return async (ctx, next) => {
    const req = ctx.req;
    if (!ctx.url) ctx.url = url.parse(`http://${req.headers.host}${req.url}`);
    const checked = check(rule, ctx.url.pathname); // 根据路径规则解析路径
    if (!ctx.route && (method === '*' || req.method === method) && !!checked) {
      ctx.route = checked;
      await aspect(ctx, next);
    } else {
      // 如果路径与路由规则不匹配，则跳过当前拦截切面，执行下一个拦截切面
      await next();
    }
  };
}

class Router {
  constructor(base = '') {
    this.baseURL = base;
  }

  get(rule, aspect) {
    return route('GET', path.join(this.baseURL, rule), aspect);
  }

  post(rule, aspect) {
    return route('POST', path.join(this.baseURL, rule), aspect);
  }

  put(rule, aspect) {
    return route('PUT', path.join(this.baseURL, rule), aspect);
  }

  delete(rule, aspect) {
    return route('DELETE', path.join(this.baseURL, rule), aspect);
  }

  all(rule, aspect) {
    return route('*', path.join(this.baseURL, rule), aspect);
  }
}

module.exports = Router;
