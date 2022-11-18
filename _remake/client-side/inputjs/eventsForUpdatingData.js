import { onAttributeEvent } from "../hummingbird/lib/dom";
import { handleUpload } from "./fileUpload";
import { getValueForClosestKey, setValueForClosestKey } from "../data-utilities";

export default function () {

  onAttributeEvent({
    eventTypes: ["input", "click", "change"],
    partialAttributeStrings: ["update:"],
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: ({
      eventType,
      matchingElement,
      matchingAttribute,
      matchingPartialAttributeString,
    }) => {
      let keyName = matchingAttribute.substring(matchingPartialAttributeString.length);
      let nodeName = matchingElement.nodeName && matchingElement.nodeName.toLowerCase();
      let inputType = matchingElement.type ? matchingElement.type.toLowerCase() : "";
      let elem = matchingElement;
      let value = null;

      // textarea and input[type='text']
      if (eventType === "input") {
        if (
          nodeName === "textarea" ||
          inputType === "text" ||
          inputType === "color" ||
          inputType === ""
        ) {
          value = matchingElement.value;
          setValueForClosestKey({ elem, keyName, value });
        }
      }

      if (eventType === "change") {

        if (inputType === "checkbox") {
          value = matchingElement.checked ? true : false;
        }


        if (inputType === "radio" || nodeName === "select") {
          value = matchingElement.value;
        }


        if (inputType === "file") {
          handleUpload({ elem: matchingElement, keyName });
        }
      }


      if (eventType === "click" && !matchingElement.closest("input, textarea, select")) {
        value = matchingElement.getAttribute(matchingAttribute);
      }

      if (value !== null) {
        setValueForClosestKey({ elem: matchingElement, keyName, value });
      }
    },
  });

  onAttributeEvent({
    eventTypes: ["click"],
    partialAttributeStrings: ["toggle:"],
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: ({ matchingElement, matchingAttribute, matchingPartialAttributeString }) => {
      let keyName = matchingAttribute.substring(matchingPartialAttributeString.length);
      let currentValue = getValueForClosestKey({ elem: matchingElement, keyName }) || "";
      if (currentValue.toLowerCase() !== "true") {
        setValueForClosestKey({ elem: matchingElement, keyName, value: true });
      } else {
        setValueForClosestKey({ elem: matchingElement, keyName, value: false });
      }
    },
  });
}
