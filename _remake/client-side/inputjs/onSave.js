import { $ } from "../queryjs";
import { getSaveData } from "../get-save-data";
import { ajaxPost } from "../hummingbird/lib/ajax";
import { debounce } from "../hummingbird/lib/functions";
import { getAttributeValueAsArray } from "../parse-data-attributes";
import optionsData from "./optionsData";
import { callOnSaveCallbacks } from "./callbacks";

export function saveData({ data, path, saveToId }) {

  window.liveJsResourcesLoaded = false;
  ajaxPost("/save", { data, path, saveToId }, function (res) {

    window.liveJsResourcesLoaded = false;
    callOnSaveCallbacks(res);
  });
}

let saveFunctionsLookup = {

  _defaultSave: function ({ data, path, saveToId, elem }) {
    saveData({ data, path, saveToId });
  },
};

export function initSaveFunctions() {
  if (optionsData.saveFunctions) {
    Object.assign(saveFunctionsLookup, optionsData.saveFunctions);
  }
}

export function callSaveFunction(targetElem) {
  let saveEnabled = !targetElem.closest("[no-save]");
  if (!saveEnabled) {
    return;
  }


  let saveElement = targetElem.closest("[custom-save], [key\\:id]");
  let isDefaultingToDataKeyIdSave = false;
  let isDefaultingToGlobalSave = false;
  let hasCustomSaveFunction = false;
  let saveFuncName = "_defaultSave";
  let savePath;
  let saveToId;


  if (!saveElement) {
    saveElement = document.body;
    isDefaultingToGlobalSave = true;
    saveFuncName = "_defaultSave";
  } else {
    if (saveElement.matches("[custom-save]")) {
      hasCustomSaveFunction = true;
      [saveFuncName, savePath, saveToId] = getSaveFuncInfo(saveElement);
    } else if (saveElement.matches("[key\\:id]")) {
      isDefaultingToDataKeyIdSave = true;
      saveFuncName = "_defaultSave";
      saveToId = saveElement.getAttribute("key:id");
    }
  }

  let saveFunc = saveFunctionsLookup[saveFuncName];
  let dataInsideSaveElement = getSaveData(saveElement);


  saveFunc({ data: dataInsideSaveElement, elem: targetElem, path: savePath, saveToId });


  let itemIdFromUrl = document.body.getAttribute("data-item-route");
  if (isDefaultingToGlobalSave && itemIdFromUrl) {
    console.log(
      `%cWarning: Data was just saved to your database, but not to the item matching the id in this page's url: "${itemIdFromUrl}". This might not be a mistake, but if it is you can correct it just add "key:${itemIdFromUrl}" to a high-level element.`,
      "color: #e03131;"
    );
  }


  if (optionsData.logDataOnSave) {
    let logDataOnSaveString = "";
    logDataOnSaveString += "[Dev mode] Logging Remake Data on save: ";

    if (isDefaultingToGlobalSave) {
      logDataOnSaveString += "Action: Saved entire page, ";
    } else if (isDefaultingToDataKeyIdSave) {
      logDataOnSaveString += `Action: Saved to nearest id (${saveToId}), `;
    } else if (hasCustomSaveFunction) {
      logDataOnSaveString += `Action: Saved to custom save function (${saveFuncName}), `;

      if (savePath) {
        logDataOnSaveString += `Action: Saved to path: ${savePath}, `;
      }

      if (saveToId) {
        logDataOnSaveString += `Action: Saved to id: ${saveToId}, `;
      }
    }

    console.log(logDataOnSaveString, "Data:", dataInsideSaveElement);
  }
}


export function callSaveFunctionNextTick(...args) {
  setTimeout(() => {
    callSaveFunction(...args);
  });
}

export function getSaveFuncInfo(saveElement) {
  let dashCaseAttrName = "custom-save";
  let args = getAttributeValueAsArray(saveElement, dashCaseAttrName);

  let funcName, savePath, saveToId;
  args.forEach(arg => {
    if (arg.startsWith("path:")) {
      savePath = arg.substring("path:".length);
    } else if (arg.startsWith("id:")) {
      saveToId = arg.substring("id:".length);
    } else {
      funcName = arg;
    }
  });

  funcName = funcName || "_defaultSave";

  return [funcName, savePath, saveToId];
}
