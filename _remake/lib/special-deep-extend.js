let isObject = a => typeof a === "object" && a !== null && !Array.isArray(a);
let isArray = a => Array.isArray(a);
let forEachKeyValuePair = (obj, cb) => {
  Object.keys(obj).forEach(function (k) {
    cb(k, obj[k]);
  });
};
let fillMissingKeys = (target, source) => {
  forEachKeyValuePair(source, (key, value) => {
    if (target[key] === undefined) {
      target[key] = value;
    }
  });
};
let findById = (arrayToSearch, objWithId) => arrayToSearch.find(a => a.id === objWithId.id);


export function specialDeepExtend(source, target) {
  if (isArray(target)) {

    if (!isArray(source)) {
      source = [];
    }

    target.forEach(function (targetChild) {

      let matchingSourceChild = findById(source, targetChild);

      if (matchingSourceChild) {

        specialDeepExtend(targetChild, matchingSourceChild);

        fillMissingKeys(targetChild, matchingSourceChild);
      }
    });
  }

  if (isObject(target)) {

    forEachKeyValuePair(target, function (key, targetValue) {

      let sourceValue = source[key];

      if (
        (isObject(sourceValue) || isArray(sourceValue)) &&
        (isObject(targetValue) || isArray(targetValue))
      ) {
        specialDeepExtend(sourceValue, targetValue);
      }
    });

    fillMissingKeys(target, source);
  }

  return target;
}
