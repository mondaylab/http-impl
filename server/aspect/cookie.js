/**
 * @description 新添加一个拦截切面来解析cookie，
 * 有了这个拦截器，我们就可以通过 ctx.cookies[key] 来访问对应的 cookie 了。
 *
 * @param {*} ctx
 * @param {*} next
 */
module.exports = async function (ctx, next) {
  const { req } = ctx;
  const cookieStr = decodeURIComponent(req.headers.cookie);
  const cookies = cookieStr.split(/\s*;\s*/);
  ctx.cookies = {};
  cookies.forEach((cookie) => {
    const [key, value] = cookie.split('=');
    ctx.cookies[key] = value;
  });
  await next();
};
