import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { forEachAttr, onAttributeEvent } from "../hummingbird/lib/dom";
import { copyLayout } from "../copy-layout";
import { getClosestElemWithKey, setValueForKeyName, getKeyNamesFromElem } from "../data-utilities";
import { syncDataNextTick } from "./syncData";
import { showError } from "../common/show-error";
import autosize from "../vendor/autosize";

export function openEditCallback(matches) {
  let editableConfig = matches.map(
    ({ eventType, matchingElement, matchingAttribute, matchingPartialAttributeString }) => {
      let attributeParts = matchingAttribute.split(":");

      let [_, keyName, ...otherOptions] = attributeParts;

      let validRemoveOptions = ["with-remove", "without-remove", "with-erase"];
      let validFormTypes = ["text", "textarea"];

      let removeOption =
        validRemoveOptions.find(str => otherOptions.includes(str)) || "with-remove";
      let formType = validFormTypes.find(str => otherOptions.includes(str)) || "text";

      return {
        keyName,
        formType,
        removeOption,
        eventType,
        matchingElement,
        matchingAttribute,
        matchingPartialAttributeString,
      };
    }
  );

  let firstMatch = editableConfig[0];
  let firstMatchElem = firstMatch.matchingElement;
  let firstMatchKeyName = firstMatch.keyName;
  let firstMatchRemoveOption = firstMatch.removeOption;
  let firstMatchTargetElem = getClosestElemWithKey({
    elem: firstMatchElem,
    keyName: firstMatchKeyName,
  });

  if (!firstMatchElem || !firstMatchKeyName || !firstMatchTargetElem) {
    showError(
      `Problem with the 'edit:' attribute on one of these elements:`,
      matches.map(m => m.matchingElement)
    );
    return;
  }

  let editablePopoverElem = document.querySelector(".remake-edit");

  removeObjectKeysFromElem({ elem: editablePopoverElem });

  let hasRemove = firstMatchRemoveOption === "with-remove";
  let hasErase = firstMatchRemoveOption === "with-erase";
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-popover`, "");
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-remove`, "");
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-erase`, "");
  setValueForKeyName({ elem: editablePopoverElem, keyName: "remake-edit-popover", value: "on" });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: "remake-edit-option-has-remove",
    value: hasRemove ? "on" : "off",
  });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: "remake-edit-option-has-erase",
    value: hasErase ? "on" : "off",
  });

  $.data(editablePopoverElem, "source", firstMatchTargetElem);

  addObjectKeysToElem({ elem: editablePopoverElem, config: editableConfig });

  syncDataNextTick({
    sourceElement: firstMatchElem,
    targetElement: editablePopoverElem,
    keyNames: editableConfig.map(obj => obj.keyName),
    shouldSyncIntoUpdateElems: true,
  });

  let remakeEditAreasElem = editablePopoverElem.querySelector(".remake-edit__edit-areas");
  remakeEditAreasElem.innerHTML = generateRemakeEditAreas({ config: editableConfig });

  copyLayout({
    sourceElem: firstMatchElem,
    targetElem: editablePopoverElem,
    dimensionsName: "width",
    xOffset: 0,
    yOffset: 0,
  });

  setTimeout(function () {
    let textareas = Array.from(editablePopoverElem.querySelectorAll("textarea"));
    textareas.forEach(el => autosize(el));
  });

  let firstFormInput = editablePopoverElem.querySelector("textarea, input");
  if (firstFormInput) {
    firstFormInput.focus();
  }
}


export default function () {
  onAttributeEvent({
    eventTypes: ["click"],
    partialAttributeStrings: ["edit:"],
    groupMatchesIntoSingleCallback: true,
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: openEditCallback,
  });

  on("submit", "[sync]", event => {
    event.preventDefault();
    let syncElement = event.currentTarget.closest("[sync]");
    syncDataNextTick({
      sourceElement: syncElement,
      targetElement: $.data(syncElement, "source"),
      keyNames: getKeyNamesFromElem(syncElement),
    });
  });

  on("click", ".remake-edit__button:not([type='submit'])", function (event) {
    event.preventDefault();
  });

  document.addEventListener("keydown", event => {

    if (event.keyCode === 27) {
      let turnedOnEditablePopover = document.querySelector('[key:remake-edit-popover="on"]');

      if (turnedOnEditablePopover) {
        setValueForKeyName({
          elem: turnedOnEditablePopover,
          keyName: "remake-edit-popover",
          value: "off",
        });
      }
    }
  });
}

function removeObjectKeysFromElem({ elem }) {
  let attributesToRemove = [];
  forEachAttr(elem, (attrName, attrValue) => {
    if (attrName.startsWith("key:") || attrName.startsWith("temporary:key:")) {
      attributesToRemove.push(attrName);
    }
  });
  attributesToRemove.forEach(attrName => elem.removeAttribute(attrName));
}

function addObjectKeysToElem({ elem, config }) {
  config.forEach(obj => {
    elem.setAttribute(`temporary:key:${obj.keyName}`, "");
  });
}

function generateRemakeEditAreas({ config }) {
  let outputHtml = "";

  config.forEach(({ formType, keyName }) => {
    let formFieldHtml;

    if (formType === "text") {
      formFieldHtml = `<input class="remake-edit__input" update:${keyName} type="text">`;
    }

    if (formType === "textarea") {
      formFieldHtml = `<textarea class="remake-edit__textarea" update:${keyName}></textarea>`;
    }

    outputHtml += `<div class="remake-edit__edit-area">${formFieldHtml}</div>`;
  });

  return outputHtml;
}
