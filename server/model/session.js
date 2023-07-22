const sessionKey = 'interceptor_js';

/**
 * session表有六个字段：
 * ID 是数据表自动生成的编号；
 * key是对应Cookie的属性值，也就是服务器随机生成的唯一ID；
 * name是要记录的Session的名字（比如：userInfo）；
 * value是以JSON格式存放的值；
 * created是Session的创建时间；
 * expires是Session的过期时间。
 */

/**
 * 根据Cookie中的ID获取用户的Session
 * @param {*} database
 * @param {*} ctx
 * @param {*} name
 * @returns
 */

async function getSession(database, ctx, name) {
  const key = ctx.cookies[sessionKey];
  if (key) {
    const now = Date.now();
    const session = await database.get(
      'SELECT * FROM session WHERE key = ? and name = ? and expires > ?',
      key,
      name,
      now
    );
    if (session) {
      return JSON.parse(session.value);
    }
  }
  return null;
}

/**
 * 创建新的Session
 * 函数setSession用于向Session表中插入或更新一条会话记录，
 * 这条记录中的key就是用户Cookie中的唯一ID。
 * 在方法getSession中，我们通过key获得这个用户的Session记录，如果存在这条记录，
 * 就返回session的value（即userInfo），否则返回null。
 * 然后，我们在用户model的登录方法中（model/user.js），加入创建session的功能。
 * @param {*} database
 * @param {*} ctx
 * @param {*} name
 * @param {*} data
 * @returns
 */
async function setSession(database, ctx, name, data) {
  try {
    const key = ctx.cookies[sessionKey];
    if (key) {
      let result = await database.get(
        'SELECT id FROM session WHERE key = ? AND name = ?',
        key,
        name
      );
      if (!result) {
        // 如果result不存在，那么插入这个session
        result = await database.run(
          `INSERT INTO session(key, name, value, created, expires) VALUES(?, ?, ?, ?, ?)`,
          key,
          name,
          JSON.stringify(data),
          Date.now(),
          Date.now + 7 * 76400 * 1000
        );
      } else {
        // 否则更新这个session
        result = await database.run(
          'UPDATE session SET value = ?, created = ?, expires = ? WHERE key = ? AND name = ?',
          JSON.stringify(data),
          Date.now(),
          Date.now() + 7 * 86400 * 1000,
          key,
          name
        );
      }
      return { err: '', result };
    }
    throw new Error('invalid cookie');
  } catch (ex) {
    return { err: ex.message };
  }
}

module.exports = {
  getSession,
  setSession
};
