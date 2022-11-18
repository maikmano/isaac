import { isValidCommand } from "../common/get-valid-element-properties";
import { showError } from "../common/show-error";
import { callSaveFunction } from "../inputjs/onSave";
import {
  triggerWatchAttributes,
  executeCommandOnMultipleElements,
  getTargetsForCommand,
} from "./commandAndWatchHelpers";
import { forEachAttr } from "../hummingbird/lib/dom";
const dashCase = require("lodash/kebabCase");
const debounce = require("lodash/debounce");


function _valueForKeyName({ method, elem, keyName, value = "" }) {
  let dashCaseKeyName = dashCase(keyName);
  let normalKeyExists = elem.hasAttribute("key:" + dashCaseKeyName);
  let temporaryKeyExists = elem.hasAttribute("temporary:key:" + dashCaseKeyName);

  if (!normalKeyExists && !temporaryKeyExists) {
    showError("You can't set a key name to a value if the key doesn't exist on the element yet");
    return;
  }

  let attrName = normalKeyExists ? "key:" + dashCaseKeyName : "temporary:key:" + dashCaseKeyName;
  let attrValue = elem.getAttribute(attrName);
  let hasValidCommand = isValidCommand({ commandName: attrValue, includingSearchCommand: true });

  // set default value
  if (
    method === "set" &&
    elem.hasAttribute(`default:${dashCaseKeyName}`) &&
    value.trim().length === 0
  ) {
    value = elem.getAttribute(`default:${dashCaseKeyName}`) || "";
  }

  let targetElems; 
  let targetAttr;
  if (!hasValidCommand) {
    targetElems = [elem];

    if (method === "set") {
      elem.setAttribute(attrName, value);
    } else {
      return elem.getAttribute(attrName);
    }
  } else {

    let targets = getTargetsForCommand({ elem, dashCaseKeyName, attrName, attrValue });
    targetElems = targets.targetElems;
    targetAttr = targets.targetAttr;
    if (method === "set") {
      executeCommandOnMultipleElements({ targetElems, targetAttr, value, method });
    } else {
      return executeCommandOnMultipleElements({ targetElems, targetAttr, value, method });
    }
  }

  if (method === "set") {
    let settingTemporaryKey = attrName.startsWith("temporary:");
    if (!settingTemporaryKey) {
      callSaveFunction(elem);
    }

    triggerWatchAttributes({ elem, dashCaseKeyName, value, targetElems });
  }
}


export function getTargetElemsForKeyName({ elem, keyName }) {
  let dashCaseKeyName = dashCase(keyName);
  let normalKeyExists = elem.hasAttribute("key:" + dashCaseKeyName);
  let attrName = normalKeyExists ? "key:" + dashCaseKeyName : "temporary:key:" + dashCaseKeyName;
  let attrValue = elem.getAttribute(attrName);
  let hasValidCommand = isValidCommand({ commandName: attrValue, includingSearchCommand: true });

  let targetElems; 
  if (!hasValidCommand) {
    targetElems = [elem];
  } else {

    let targets = getTargetsForCommand({ elem, dashCaseKeyName, attrName, attrValue });
    targetElems = targets.targetElems;
  }

  return targetElems;
}


export function setValueForKeyName({ elem, keyName, value }) {
  _valueForKeyName({ method: "set", elem, keyName, value });
}


export function getValueForKeyName({ elem, keyName }) {
  return _valueForKeyName({ method: "get", elem, keyName });
}

export function getClosestElemWithKey({ elem, keyName }) {
  let dashCaseKeyName = dashCase(keyName);
  let closestKeyElem = elem.closest(`[key\\:${dashCaseKeyName}]`);
  let closestTempKeyElem =
    !closestKeyElem && elem.closest(`[temporary\\:key\\:${dashCaseKeyName}]`);
  return closestKeyElem || closestTempKeyElem;
}

function _valueForClosestKey({ method, elem, keyName, value }) {
  let closestElemWithKey = getClosestElemWithKey({ elem, keyName });

  if (closestElemWithKey) {
    if (method === "set") {
      setValueForKeyName({ elem: closestElemWithKey, keyName, value });
    } else {
      return getValueForKeyName({ elem: closestElemWithKey, keyName });
    }
  }
}

export function getValueForClosestKey({ elem, keyName }) {
  return _valueForClosestKey({ method: "get", elem, keyName });
}

export function setValueForClosestKey({ elem, keyName, value }) {
  _valueForClosestKey({ method: "set", elem, keyName, value });
}


export function getKeyNamesFromElem(elem) {
  let keyPrefix = "key:";
  let temporaryKeyPrefix = "temporary:key:";
  let keyNames = [];

  forEachAttr(elem, attrName => {
    if (attrName.indexOf(keyPrefix) === 0) {
      let keyName = attrName.substring(keyPrefix.length);
      keyNames.push(keyName);
    }
    if (attrName.indexOf(temporaryKeyPrefix) === 0) {
      let keyName = attrName.substring(temporaryKeyPrefix.length);
      keyNames.push(keyName);
    }
  });

  return keyNames;
}
