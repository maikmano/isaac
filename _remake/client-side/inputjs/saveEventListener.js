import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { getParents } from "../hummingbird/lib/dom";
import { callWatchFunctionsOnElements } from "../data-utilities";
import { callSaveFunctionNextTick } from "./onSave";

export default function () {
  on("click", "[save]", function (event) {
    let elem = event.currentTarget;

    if (elem.closest("[disable-events]")) {
      return;
    }
    let parents = getParents({ elem, includeCurrentElement: true });
    callWatchFunctionsOnElements(parents);


    callSaveFunctionNextTick(elem);
  });

  on("input", "[save]", function (event) {
    let elem = event.currentTarget;

    if (elem.closest("[disable-events]")) {
      return;
    }

    let parents = getParents({ elem, includeCurrentElement: true });
    callWatchFunctionsOnElements(parents);

    callSaveFunctionNextTick(elem);
  });
}
