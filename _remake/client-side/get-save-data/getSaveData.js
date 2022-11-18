import { createDataObjectFromElement, addDataFromElementToDataObject } from "./getSaveDataHelpers";


export function getSaveData(rootNode) {
  let rootData;

  function getDataFromDom(currentElement, parentData) {

    let canElementDataBeParsed =
      currentElement.hasAttribute("object") || currentElement.hasAttribute("array");

    let skipElemAndChildren = currentElement.hasAttribute("ignore-data");

    if (skipElemAndChildren) {
      return;
    }


    if (canElementDataBeParsed) {

      
      if (parentData) {
        parentData = addDataFromElementToDataObject(currentElement, parentData);
      }


      if (!parentData && !rootData) {

        [parentData, rootData] = createDataObjectFromElement(currentElement);
      } else if (!parentData && rootData) {


        parentData = addDataFromElementToDataObject(currentElement, rootData);
      }
    }

    let children = currentElement.children;
    for (var i = 0; i < children.length; i++) {
      getDataFromDom(children[i], parentData);
    }

    return rootData;
  }

  return getDataFromDom(rootNode);
}
