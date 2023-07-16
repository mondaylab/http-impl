/**
 * @description
 * 写一个拦截切面，专门用来解析http请求中的数据
 * 包括URL参数和POST请求数据
 */
const url = require('url');
const querysrting = require('querystring');

module.exports = async function (ctx, next) {
  const { req } = ctx;
  const { query } = url.parse(`http://${req.headers.host}${req.url}`);
  // 使用内置模块 querystring 解析URL参数
  ctx.params = querysrting.parse(query);
  await next();
};
