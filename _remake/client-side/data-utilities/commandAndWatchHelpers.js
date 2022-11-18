import { isValidCommand } from "../common/get-valid-element-properties";
import { parseStringWithIndefiniteNumberOfParams } from "../parse-data-attributes";
import {
  getValueForClosestKey,
  getClosestElemWithKey,
  getTargetElemsForKeyName,
  getValueForKeyName,
} from "./getAndSetKeyValues";
import { forEachAttr } from "../hummingbird/lib/dom";
import { showWarning } from "../common/show-error";
import optionsData from "../inputjs/optionsData";
const camelCase = require("lodash/camelCase");
const difference = require("lodash/difference");


export function callWatchFunctionsOnElements(elems) {
  elems.forEach(elem => {
    forEachAttr(elem, (attrName, attrValue) => {
      if (attrName.indexOf("watch:") === 0) {
        let dashCaseKeyName = attrName.substring("watch:".length);
        let closestElemWithKey = getClosestElemWithKey({ elem, keyName: dashCaseKeyName });
        let value = getValueForKeyName({ elem: closestElemWithKey, keyName: dashCaseKeyName });
        let targetElems = getTargetElemsForKeyName({ elem, keyName: dashCaseKeyName });
        triggerWatchAttributes({ elem, dashCaseKeyName, value, targetElems });
      }
    });
  });
}


export function triggerWatchAttributes({ elem, dashCaseKeyName, value, targetElems }) {
  let selector = `[watch\\:${dashCaseKeyName}]`;
  let attr = `watch:${dashCaseKeyName}`;

  let watchElems = difference(
    elem.querySelectorAll(selector),
    elem.querySelectorAll(`:scope [key\\:${dashCaseKeyName}] [watch\\:${dashCaseKeyName}]`)
  );
  if (elem.matches(selector)) {
    watchElems.unshift(elem);
  }

  watchElems.forEach(watchElem => {
    let watchAttrValue = watchElem.getAttribute(attr);

    let listOfCommands = parseStringWithIndefiniteNumberOfParams(watchAttrValue);
    listOfCommands.forEach(({ funcName, args }) => {
      if (isValidCommand({ commandName: funcName })) {
        executeCommand({ elem: watchElem, commandName: funcName, value, method: "set" });
      } else {

        let watchFunc = optionsData.watchFunctions && optionsData.watchFunctions[funcName];
        if (typeof watchFunc === "function") {
          watchFunc({
            watchElem, 
            watchAttrName: attr, 
            watchAttrValue: watchAttrValue, 
            dashCaseKeyName, 
            camelCaseKeyName: camelCase(dashCaseKeyName), 
            value, 
            watchFuncName: funcName, 
            watchFuncArgs: args, 
            dataSourceElem: elem, 
            dataTargetElems: targetElems, 
          });
        }
      }
    });
  });
}


export function executeCommandOnMultipleElements({ targetElems = [], targetAttr, value, method }) {
  for (let i = 0; i < targetElems.length; i++) {
    let targetElem = targetElems[i];

    
    let commandName = targetElem.getAttribute(targetAttr);

    if (isValidCommand({ commandName })) {
      if (method === "set") {
        executeCommand({ elem: targetElem, commandName, value, method });
      } else {
        return executeCommand({ elem: targetElem, commandName, value, method });
      }
    }
  }
}

export function getTargetsForCommand({ elem, dashCaseKeyName, attrName, attrValue }) {
  let targetAttr;
  let targetElems;

  if (attrValue === "@search") {
    let selector = `[target\\:${dashCaseKeyName}]`;
    targetAttr = `target:${dashCaseKeyName}`;
    targetElems = Array.from(elem.querySelectorAll(selector));

    if (elem.matches(selector)) {
      targetElems.unshift(elem);
    }
  } else {
   
    
    targetAttr = attrName; 
    targetElems = [elem];
  }

  return { targetElems, targetAttr };
}

function executeCommand({ elem, commandName, value, method }) {
  if (commandName.indexOf("@attr:") === 0) {

    let attr = commandName.substring("@attr:".length);
    if (method === "set") {
      elem.setAttribute(attr, value);
    } else {
      return elem.getAttribute(attr);
    }
  } else {

    
    let prop = commandName.substring("@".length);
    if (prop.toLowerCase() === "src" && elem.tagName.toLowerCase() === "img") {
      showWarning(
        "Please use @attr:src instead of @src for a better experience.\n  @attr:src will get an empty string if there's no value for img.src (ideal), while @src will get the current page's url (not ideal).",
        elem
      );
    }
    if (method === "set") {
      elem[prop] = value;
    } else {
      return elem[prop];
    }
  }
}
