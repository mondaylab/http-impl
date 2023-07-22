/**
 * 当点击按钮添加任务时，浏览器通过 POST /add请求 将添加的数据保存到数据库
 * @param {*} id
 * @param {*} list
 * @param {*} text
 * @param {*} state
 * @returns
 */
function addItem(id, list, text, state = 'todo') {
  const removeSVG = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 22" style="enable-background:new 0 0 22 22;" xml:space="preserve">
      <g>
        <path d="M16.1,3.6h-1.9V3.3c0-1.3-1-2.3-2.3-2.3h-1.7C8.9,1,7.8,2,7.8,3.3v0.2H5.9c-1.3,0-2.3,1-2.3,2.3v1.3c0,0.5,0.4,0.9,0.9,1v10.5c0,1.3,1,2.3,2.3,2.3h8.5c1.3,0,2.3-1,2.3-2.3V8.2c0.5-0.1,0.9-0.5,0.9-1V5.9C18.4,4.6,17.4,3.6,16.1,3.6z M9.1,3.3c0-0.6,0.5-1.1,1.1-1.1h1.7c0.6,0,1.1,0.5,1.1,1.1v0.2H9.1V3.3z M16.3,18.7c0,0.6-0.5,1.1-1.1,1.1H6.7c-0.6,0-1.1-0.5-1.1-1.1V8.2h10.6V18.7z M17.2,7H4.8V5.9c0-0.6,0.5-1.1,1.1-1.1h10.2c0.6,0,1.1,0.5,1.1,1.1V7z"/>
        <path d="M11,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6v6.8C11.6,17.7,11.4,18,11,18z"/>
        <path d="M8,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6c0.4,0,0.6,0.3,0.6,0.6v6.8C8.7,17.7,8.4,18,8,18z"/>
        <path d="M14,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6c0.4,0,0.6,0.3,0.6,0.6v6.8C14.6,17.7,14.3,18,14,18z"/>
      </g>
    </svg>
  `;
  const completeSVG = `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 22" style="enable-background:new 0 0 22 22;" xml:space="preserve">
      <g>
        <path d="M9.7,14.4L9.7,14.4c-0.2,0-0.4-0.1-0.5-0.2l-2.7-2.7c-0.3-0.3-0.3-0.8,0-1.1s0.8-0.3,1.1,0l2.1,2.1l4.8-4.8c0.3-0.3,0.8-0.3,1.1,0s0.3,0.8,0,1.1l-5.3,5.3C10.1,14.3,9.9,14.4,9.7,14.4z"/>
      </g>
    </svg>
  `;

  const item = document.createElement('li');
  item.className = state;
  item.innerHTML = `${text}<button class="remove">${removeSVG}</button><button class="complete">${completeSVG}</button>`;
  list.insertBefore(item, list.children[0]);

  item.dataset.id = id;

  const completeBtn = item.querySelector('button.complete');

  completeBtn.addEventListener('click', () => {
    const id = item.dataset.id;
    if (item.className === 'todo') {
      updateItem(id, 1);
      completeItem(item);
    } else {
      updateItem(id, 0);
      uncompleteItem(item);
    }
  });

  const removeBtn = item.querySelector('button.remove');

  removeBtn.addEventListener('click', () => {
    updateItem(id, 2);
    removeItem(item);
  });

  return item;
}

/**
 * 将任务变更为已完成状态（属于变更数据状态的操作，放在 /update 接口里面来进行操作）
 * @param {*} item
 */
function completeItem(item) {
  const parent = item.parentNode;
  const completedItem = parent.querySelector('li.completed');
  if (completedItem) {
    parent.insertBefore(item, completedItem);
  } else {
    parent.appendChild(item);
  }
  item.className = 'completed';
}

/**
 * 将任务从已完成恢复为未完成（属于变更数据状态的操作，放在 /update 接口里面来进行操作）
 * @param {*} item
 */
function uncompleteItem(item) {
  const parent = item.parentNode;
  parent.insertBefore(item, parent.children[0]);
  item.className = 'todo';
}

function removeItem(item) {
  const parent = item.parentNode;
  parent.removeChild(item);
}

const states = ['todo', 'completed'];

async function updateItem(id, state) {
  const result = await (
    await fetch('/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `id=${id}&state=${state}`
    })
  ).json();

  return result;
}

/**
 * 使用fetch方法请求服务端 /add 接口，method是post，
 * Content-Type是application/x-www-form-urlencoded，然后我们将text和state传给服务器
 * @param {*} text
 * @returns
 */
async function saveItem(text) {
  const result = await (
    await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `text=${text}&state=0`
    })
  ).json();

  return result;
}

/**
 * 通过浏览器的fetch方法请求 GET /list，以获取todo表的数据，
 * 并通过addItem方法将数据渲染到页面上。
 * @param {*} list
 */
async function loadItems(list) {
  const { err, data } = await (await fetch('/list')).json();
  if (err) {
    window.location.replace('/login.html');
  } else {
    data.forEach(({ id, state, text }) =>
      addItem(id, list, text, states[state])
    );
  }
}

const list = document.querySelector('ul.todolist');
const addItemBtn = document.getElementById('addItem');
const inputText = document.getElementById('itemText');

addItemBtn.addEventListener('click', async () => {
  const text = inputText.value;
  if (text) {
    const result = await saveItem(text);
    if (!result.err) {
      addItem(result.data.lastID, list, text);
      inputText.value = '';
      inputText.focus();
    } else {
      throw new Error(result.err);
    }
  }
});

window.addEventListener('keydown', (event) => {
  const code = event.code;
  if (code === 'Enter' || code === 'NumpadEnter') {
    addItemBtn.click();
  }
});

/**
 * 当浏览器加载index.html页面后，会自动运行 app.js 中的 loadItem 方法，
 * 从服务器端获取任务列表。
 */
loadItems(list);
