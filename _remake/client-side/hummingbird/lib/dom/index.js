
export function forEachAncestorMatch({ elem, selector, callback }) {
  let matchingElem = elem.closest(selector);

  if (matchingElem) {
    callback(matchingElem);

    let matchingElemParent = matchingElem.parentNode;
    if (matchingElemParent) {
      forEachAncestorMatch({ elem: matchingElemParent, selector, callback });
    }
  }
}

export function forEachMatchingElem(parentElem, selector, callback) {
  if (parentElem.matches(selector)) {
    callback(parentElem);
  }

  let childMatches = Array.from(parentElem.querySelectorAll(selector));

  childMatches.forEach(childMatch => {
    callback(childMatch);
  });
}

export function forEachNestedElem(elem, callback) {
  callback(elem);

  for (let i = 0, l = elem.children.length; i < l; i++) {
    forEachNestedElem(elem.children[i], callback);
  }
}

export function findNestedElem(elem, testFunc) {
  let firstMatch;

  forEachNestedElem(elem, function (el) {
    if (!firstMatch && testFunc(el)) {
      firstMatch = el;
    }
  });
  return firstMatch;
}

export function getParents({ elem, selector, includeCurrentElement }) {
  let parents = [];

  if (!includeCurrentElement) {
    elem = elem.parentNode;
  }

  for (; elem && elem !== document; elem = elem.parentNode) {
    if (!selector || (selector && elem.matches(selector))) {
      parents.push(elem);
    }
  }

  return parents;
}

export function findNearest({ elem, selector }) {
  if (elem === document.documentElement) {
    return;
  }

  if (elem.matches(selector)) {
    return elem;
  }

  let matchingChildElem = elem.querySelector(selector);
  if (matchingChildElem) {
    return matchingChildElem;
  }

  return findNearest({ elem: elem.parentElement, selector });
}


export function forEachAttr(elem, fn) {
  let attributes = elem.attributes;
  let attributesLength = attributes.length;

  for (var i = 0; i < attributesLength; i++) {
    let attrName = attributes[i].name;
    let attrValue = attributes[i].value;

    fn(attrName, attrValue);
  }
}


export function getElementOffset(el) {
  let clientRect = el.getBoundingClientRect();
  let top = clientRect.top + window.pageYOffset;
  let left = clientRect.left + window.pageXOffset;
  let right = clientRect.width + left;
  let bottom = clientRect.height + top;
  let width = right - left;
  let height = bottom - top;

  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left,
    width: width,
    height: height,
  };
}


function getAttributeNames({ elem }) {
  let elemAttributes = elem.attributes;
  let attributes = [];

  for (let i = 0; i < elemAttributes.length; i++) {
    attributes.push(elemAttributes[i].name);
  }

  return attributes;
}

function getAttributesThatElemMatchesPartOf({ elem, partialAttributeString }) {
  let elemAttributes = getAttributeNames({ elem });
  return elemAttributes.filter(attr => attr.indexOf(partialAttributeString) !== -1);
}


export function onAttributeEvent({
  eventTypes = ["click"],
  partialAttributeStrings,
  matchesSelectors,
  callback,
  groupMatchesIntoSingleCallback,
  filterOutElemsInsideAncestor,
}) {
  eventTypes.forEach(eventType => {
    document.addEventListener(eventType, function (event) {
      let targetElem = event.target;

      if (filterOutElemsInsideAncestor && targetElem.closest(filterOutElemsInsideAncestor)) {
        return;
      }

      let elemAndParents = getParents({ elem: targetElem, includeCurrentElement: true });
      let matchingElems = [];

      for (let i = 0; i < elemAndParents.length; i++) {
        let elem = elemAndParents[i];

        partialAttributeStrings.forEach(partialAttributeString => {
          let matchingAttributes = getAttributesThatElemMatchesPartOf({
            elem,
            partialAttributeString,
          });
          matchingAttributes.forEach(matchingAttribute => {
            if (!matchesSelectors || matchesSelectors.every(selector => elem.matches(selector))) {
              matchingElems.push({
                matchingElement: elem,
                matchingAttribute,
                value: elem.value || "",
                eventType,
                matchingPartialAttributeString: partialAttributeString,
              });
            }
          });
        });
      }

      if (matchingElems.length) {
        if (!groupMatchesIntoSingleCallback) {
          matchingElems.forEach(m => callback(m));
        } else {
          callback(matchingElems);
        }
      }
    });
  });
}
