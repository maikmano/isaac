import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { callSaveFunctionNextTick } from "./onSave";
import { syncDataNextTick } from "./syncData";
import { setAllDataToEmptyStringsExceptIds, getKeyNamesFromElem } from "../data-utilities";
import { callOnRemoveItemCallbacks } from "./callbacks";

export function initRemoveAndHideEventListeners() {

  on("click", "[remove],[remove\\:with-confirm]", function (event) {
    if (event.target.closest("[disable-events]")) {
      return;
    }

    if (event.currentTarget.hasAttribute("remove:with-confirm")) {
      if (!window.confirm("Are you sure you want to delete this element?")) {
        return;
      }
    }


    let syncElement = event.currentTarget.closest("[sync]");


    let sourceElement;
    if (syncElement) {

      sourceElement = $.data(syncElement, "source");
    } else {

      sourceElement = event.currentTarget;
    }

    let elemWithData = sourceElement.closest("[object]");


    let parentElement = elemWithData.parentElement;


    elemWithData.remove();


    
    callSaveFunctionNextTick(parentElement);

    callOnRemoveItemCallbacks();
  });


  on("click", "[erase],[erase\\:with-confirm]", function (event) {
    if (event.target.closest("[disable-events]")) {
      return;
    }

    if (event.currentTarget.hasAttribute("erase:with-confirm")) {
      if (!window.confirm("Are you sure you want to clear this data?")) {
        return;
      }
    }


    let syncElement = event.currentTarget.closest("[sync]");

    if (syncElement) {

      setAllDataToEmptyStringsExceptIds(syncElement);


      syncDataNextTick({
        sourceElement: syncElement,
        targetElement: $.data(syncElement, "source"),
        keyNames: getKeyNamesFromElem(syncElement),
      });
    } else {

      let elemWithData = event.currentTarget.closest("[object]");

      setAllDataToEmptyStringsExceptIds(elemWithData);
    }

    callOnRemoveItemCallbacks();
  });
}
