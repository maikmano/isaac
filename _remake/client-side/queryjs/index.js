
var $ = function (selector) {
  return new QueryObj(selector);
};

let data = [];
$.data = function (elem, key, value) {
  if (!elem || !key) {
    return;
  }

  if (!value) {
    let match = data.find(item => item.elem === elem && item.key === key);
    return match && match.value;
  }

  if (value) {
    let existingIndex = data.findIndex(item => item.elem === elem && item.key === key);

    if (existingIndex > -1) {
      data.splice(existingIndex, 1);
    }

    data.push({ key, value, elem });
  }
};

$.arr = function (arrLike) {
  if (arrLike === null || arrLike === undefined) {
    return [];
  } else {
    return Array.from(arrLike);
  }
};

class QueryObj {
  constructor(selector) {
    let nodeList = document.querySelectorAll(selector);
    let nodeListArr = Array.from(nodeList);

    if (selector.endsWith(":first")) {
      nodeListArr = nodeListArr.slice(0, 1);
    }

    this.arr = nodeListArr;
  }
  get(index) {
    if (index === undefined) {
      return this.arr;
    }
    try {
      return this.arr[index];
    } catch (err) {
      return undefined;
    }
  }
  data(key, value) {
    for (var i = 0; i < this.arr.length; i++) {
      let elem = this.arr[i];

      $.data(elem, key, value);
    }
  }
  on(name, cb) {
    this.arr.forEach(el => {
      el.addEventListener(name, cb);
    });
  }
}

// window.$ = $;

export { $ };
