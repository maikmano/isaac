import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { getElementOffset } from "../hummingbird/lib/dom";
import {
  parseCopyLayoutAttributes,
  parseCopyPositionAttributes,
  parseCopyDimensionsAttributes,
} from "../parse-data-attributes";



let lookupParser = [
  {
    selector: "[data-copy-layout]",
    parser: parseCopyLayoutAttributes,
    name: "both",
  },
  {
    selector: "[data-copy-position]",
    parser: parseCopyPositionAttributes,
    name: "position",
  },
  {
    selector: "[data-copy-dimensions]",
    parser: parseCopyDimensionsAttributes,
    name: "dimensions",
  },
];


on("click", "[data-copy-layout], [data-copy-position], [data-copy-dimensions]", event => {
  let sourceElement = event.currentTarget;

  let listOfElementLayoutData = getListOfElementLayoutData(sourceElement);

  listOfElementLayoutData.forEach(
    ({
      selectorForPositionTarget,
      xOffset,
      yOffset,
      dimensionsName,
      selectorForDimensionsTarget,
      copyMethod,
    }) => {

      let sourceElementOffsetData = getElementOffset(sourceElement);


      if (copyMethod === "dimensions" || copyMethod === "both") {

        if (!selectorForDimensionsTarget) {
          selectorForDimensionsTarget = selectorForPositionTarget;
        }


        copyDimensions(sourceElementOffsetData, selectorForDimensionsTarget, dimensionsName);
      }


      if (copyMethod === "position" || copyMethod === "both") {

        copyPosition(sourceElementOffsetData, selectorForPositionTarget, xOffset, yOffset);
      }
    }
  );
});

function getListOfElementLayoutData(sourceElement) {
  let parsedData = [];

  lookupParser.forEach(parser => {
    if (sourceElement.matches(parser.selector)) {

      let elemData = parser.parser(sourceElement); // e.g. {"selectorForPositionTarget", "xOffset", "yOffset", "dimensionsName", "selectorForDimensionsElTarget

      elemData.copyMethod = parser.name;

      if (elemData.xOffset) {
        elemData.xOffset = parseInt(elemData.xOffset, 10);
      }

      if (elemData.yOffset) {
        elemData.yOffset = parseInt(elemData.yOffset, 10);
      }

      parsedData.push(elemData);
    }
  });

  return parsedData; 
}

function copyDimensions(sourceElementOffsetData, selectorForDimensionsTarget, dimensionsName) {

  let { width, height } = sourceElementOffsetData;

  $(selectorForDimensionsTarget).arr.forEach(targetElem => {

    if (dimensionsName === "width" || dimensionsName === "both") {
      targetElem.style.width = width + "px";
    }

    if (dimensionsName === "height" || dimensionsName === "both") {
      targetElem.style.height = height + "px";
    }
  });
}

function copyPosition(
  sourceElementOffsetData,
  selectorForPositionTarget,
  xOffset = 0,
  yOffset = 0
) {
  // get the new position data we want to set
  let { left, top } = sourceElementOffsetData;
  left += xOffset;
  top += yOffset;

  // loop through the target elements
  $(selectorForPositionTarget).arr.forEach(targetElem => {
    // set a new top position
    targetElem.style.top = top + "px";

    // set a new left position
    targetElem.style.left = left + "px";
  });
}

// for external use. the other methods would need to be adapted before they're exported
export function copyLayout({
  sourceElem,
  targetElem,
  dimensionsName = "width",
  xOffset = 0,
  yOffset = 0,
} = {}) {
  let sourceElemOffsetData = getElementOffset(sourceElem);

  // copy position
  let { left, top } = sourceElemOffsetData;
  left += xOffset;
  top += yOffset;
  targetElem.style.top = top + "px";
  targetElem.style.left = left + "px";

  // copy dimensions
  let { width, height } = sourceElemOffsetData;
  if (dimensionsName === "width" || dimensionsName === "both") {
    targetElem.style.width = width + "px";
  }
  if (dimensionsName === "height" || dimensionsName === "both") {
    targetElem.style.height = height + "px";
  }
}
