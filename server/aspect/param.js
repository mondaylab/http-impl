/**
 * @description
 * 写一个拦截切面，专门用来解析http请求中的数据
 * 包括URL参数和POST请求数据
 */
const url = require('url');
const querysrting = require('querystring');

module.exports = async function (ctx, next) {
  const { req } = ctx;
  // 解析query数据
  const { query } = url.parse(`http://${req.headers.host}${req.url}`);
  // 使用内置模块 querystring 解析URL参数
  ctx.params = querysrting.parse(query);
  // 解析POST
  if (req.method === 'POST') {
    const headers = req.headers;

    // 读取POST的body数据
    const body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk.toString(); // convert Buffer to string
      });
      req.on('end', () => {
        resolve(data);
      });
    });
    ctx.params = ctx.params || {};
    if (headers['content-type'] === 'application/x-www-form-urlencoded') {
      Object.assign(ctx.params, querystring.parse(body));
    } else if (headers['content-type'] === 'application/json') {
      Object.assign(ctx.params, JSON.parse(body));
    }
  }
  await next();
};

/**
 * 简单解释下：
 * 读取 POST 请求的 BODY 是一个异步的过程：
 * 监听 req 对象的 data 和 end 事件，当 data 事件触发表示数据块被接收，end 事件触发表示数据接收完毕。
 * 然后，我们判断请求头的 Content-Type 字段，如果是application/x-www-form-urlencoded，那么用 querystring 模块来解析；
 * 如果是application/json，那么直接 JSON.parse 即可。
 * 最终我们将解析的数据信息写入到 ctx.params 对象中，这样其他的拦截切面就可以使用它了。
 */
