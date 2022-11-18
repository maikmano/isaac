const process = require("process");
const changeCase = require("change-case");
const { readDotRemake } = require("./dot-remake");


function setEnvironmentVariables() {
  const dotRemakeObj = readDotRemake();
  Object.keys(dotRemakeObj).forEach(key => {

    const skuKey = changeCase.snakeCase(key).toUpperCase();
    process.env[skuKey] = dotRemakeObj[key];
  });
}

module.exports = { setEnvironmentVariables };
