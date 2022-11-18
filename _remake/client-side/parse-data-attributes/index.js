
function removeSpacesInParentheses(str) {
  let letters = str.split("");
  let newLetters = [];

  let inParentheses = false;
  for (let i = 0; i < letters.length; i++) {
    let currentLetter = letters[i];

    if (currentLetter === "(") {
      inParentheses = true;
    } else if (currentLetter === ")") {
      inParentheses = false;
    } else if (inParentheses && currentLetter === " ") {
      currentLetter = "";
    }

    newLetters.push(currentLetter);
  }

  return newLetters.join("");
}

function formatSpaces(str) {
  return str.trim().replace(/  +/g, " ");
}

function parseAttributeString(attributesString) {
  let formattedString = removeSpacesInParentheses(formatSpaces(attributesString)); 
  let separatedParamSections = formattedString.split(" "); 
  let separatedAllParams = separatedParamSections.map(str =>
    str.replace(/\s|\)/g, "").split(/\(|,/)
  ); 

  return separatedAllParams;
}

function makeParseFunction(attributeName, keyNames) {
  return function parseFunction(elem) {
    let attributesString = elem.getAttribute(attributeName); 

    if (!attributesString) {
      return [];
    }

    let parsedAttributeValues = parseAttributeString(attributesString); 

    return parsedAttributeValues.map(function (arrayOfValues) {
      let returnObj = {};
      keyNames.forEach(function (keyName, index) {
        let val = arrayOfValues[index];
        if (val) {
          returnObj[keyName] = arrayOfValues[index];
        }
      });
      return returnObj;
    });
  };
}

let parseSwitchAttributes = makeParseFunction("data-switches", ["name", "auto", "customName"]);
let parseSwitchActionAttributes = makeParseFunction("data-switch-actions", [
  "name",
  "type",
  "context",
]);
let parseSwitchStopAttributes = makeParseFunction("data-switch-stop", ["name"]);
let parseSwitchedOnAttributes = makeParseFunction("data-switched-on", ["name"]);

function parseStringWithIndefiniteNumberOfParams(attributesString) {
  if (!attributesString) {
    return [];
  }

  let parsedAttributeValues = parseAttributeString(attributesString); 
  return parsedAttributeValues.map(function (arrayOfValues) {
    return {
      funcName: arrayOfValues[0],
      args: arrayOfValues.slice(1),
    };
  });
}

function makeSimpleParseFunction(attributeName, keyNames) {
  return function parseFunction(elem) {
    let attributesString = elem.getAttribute(attributeName);

    if (!attributesString) {
      return {};
    }

    attributesString = formatSpaces(attributesString);
    let parsedAttributeValues = attributesString.split(" "); 

    return parsedAttributeValues.reduce((accumulator, currentValue, index) => {
      let keyName = keyNames[index];

      accumulator[keyName] = currentValue;

      return accumulator;
    }, {});
  };
}

let parseCopyLayoutAttributes = makeSimpleParseFunction("data-copy-layout", [
  "selectorForPositionTarget",
  "xOffset",
  "yOffset",
  "dimensionsName",
  "selectorForDimensionsTarget",
]);
let parseCopyPositionAttributes = makeSimpleParseFunction("data-copy-position", [
  "selectorForPositionTarget",
  "xOffset",
  "yOffset",
]);
let parseCopyDimensionsAttributes = makeSimpleParseFunction("data-copy-dimensions", [
  "selectorForDimensionsTarget",
  "dimensionsName",
]);

function getAttributeValueAsArray(elem, attributeName) {

  let attributesString = elem.getAttribute(attributeName);

  if (!attributesString) {
    return [];
  }

  attributesString = formatSpaces(attributesString);

  return attributesString.split(" ");
}

let regexForPhrase = /^[^\(\):,\s]+$/;
let regexForPhraseOrSpecialCharacter = /([^\(\):,\s]+|[\(\):,]+)/g;

function getParts(attributeString) {
  return attributeString.match(regexForPhraseOrSpecialCharacter);
}

function assembleResult(parts) {
  let currentObject;
  let extractedObjects = [];
  let isWithinParens = false;
  let hasModifierBeenProcessed = false;

  parts.forEach((currentPart, index) => {
    let previousPart = parts[index - 1];
    let nextPart = parts[index + 1];

    if (!currentPart) {
      return;
    }

    if (previousPart === "(") {
      isWithinParens = true;
    }
    if (previousPart === ":" || (previousPart === "(" && nextPart !== ":" && nextPart !== ")")) {
      hasModifierBeenProcessed = true;
    }

    if (currentPart === ")") {
      currentObject = undefined;
      isWithinParens = false;
      hasModifierBeenProcessed = false;
    }

    if (
      regexForPhrase.test(currentPart) &&
      (nextPart === "(" || (!isWithinParens && currentPart !== "(" && currentPart !== ")"))
    ) {

      currentObject = {};
      extractedObjects.push(currentObject);

      currentObject.name = currentPart.trim();
    }

    if (previousPart === "(" && (nextPart === ":" || nextPart === ")")) {

      if (regexForPhrase.test(currentPart)) {
        currentObject.modifier = currentPart.trim();
      }
    }

    if (isWithinParens && hasModifierBeenProcessed && regexForPhrase.test(currentPart)) {
      currentObject.args = currentObject.args || [];
      currentObject.args.push(currentPart.trim());
    }
  });

  return extractedObjects;
}


function processAttributeString(attributeString) {
  let parts = getParts(attributeString);
  let extractedObjects = assembleResult(parts);

  return extractedObjects;
}

export {
  parseSwitchAttributes,
  parseSwitchActionAttributes,
  parseSwitchStopAttributes,
  parseSwitchedOnAttributes,
  parseCopyLayoutAttributes,
  parseCopyPositionAttributes,
  parseCopyDimensionsAttributes,
  parseStringWithIndefiniteNumberOfParams,
  formatSpaces,
  getAttributeValueAsArray,
  processAttributeString,
};
