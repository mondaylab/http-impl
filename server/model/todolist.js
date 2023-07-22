async function getList(database, userInfo) {
  const result = await database.all(
    `SELECT * FROM todo WHERE state <> 2 and userid = ${userInfo.id} ORDER BY state DESC`
  );
}

/**
 * 增加一个addTask方法，将text、state信息插入到todo表中
 * @param {*} database
 * @param {*} userInfo
 * @param {*} param2
 * @returns
 */
async function addTask(database, userInfo, { text, state }) {
  try {
    const data = await database.run(
      `INSERT INTO todo(text, state, userid) VALUES (?, ?, ?)`,
      text,
      state,
      userInfo.id
    );
    return { err: '', data };
  } catch (ex) {
    return { err: ex.message };
  }
}

async function updateTask(database, { id, state }) {
  try {
    const data = await database.run(
      `UPDATE todo SET state = ? WHERE id = ?`,
      state,
      id
    );
    return { err: '', data };
  } catch (ex) {
    return { err: ex.message };
  }
}

module.exports = {
  getList,
  addTask,
  updateTask
};
