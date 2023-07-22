const crypto = require('crypto');

const { setSession } = require('./session');

const sessionName = 'userInfo';

async function login(database, ctx, { name, passwd }) {
  const userInfo = await database.get(
    'SELECT * FROM user WHERE name = ?',
    name
  );
  /**
   * 我们一般在数据库中存储明文密码，而是存储加密过的字符串，这样就可以避免用户密码泄露。
   * 在 Node.js 中，我们可以使用内置模块crypto将用户的密码变成加密的字符串。
   * 这里的 salt 是一个随机字符串，这么做可以避免密码碰撞攻击，增加安全性。
   * 比如用户的密码是123456，但是数据库中保存的是字符串xypte123456经过sha256加密后的结果。
   */
  const salt = 'xypte';
  const hash = crypto
    .createHash('sha256')
    .update(`${salt}${passwd}`, 'utf8')
    .digest()
    .toString('hex');
  if (userInfo && hash === userInfo.password) {
    const data = { id: userInfo.id, name: userInfo.name };
    setSession(database, ctx, sessionName, data);
    return data;
  }
  return null;
}

module.exports = {
  login
};
