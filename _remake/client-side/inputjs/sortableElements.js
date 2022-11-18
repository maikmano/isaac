import optionsData from "./optionsData";
import { onAddItem } from "./callbacks";
import { callSaveFunction } from "./onSave";
const merge = require("lodash/merge");

export default function initSortableElements() {

  makeSortable({ elemToSearch: document });

  if (!optionsData.alreadyInitialized) {

    onAddItem(function ({ success, listElem, itemElem, templateName, ajaxResponse }) {
      if (success) {
        makeSortable({ elemToSearch: itemElem });
      }
    });
  }
}

function makeSortable({ elemToSearch }) {
  const { sortablejs, sortableOptions } = optionsData.sortable;
  let sortableElems = Array.from(elemToSearch.querySelectorAll("[sortable]"));

  sortableElems.forEach(sortableListElem => {
    if (sortableListElem.closest("[disable-events]")) {
      return;
    }

    if (sortablejs.get(sortableListElem)) {
      return;
    }


    let options = {
      onEnd: function (event) {
        callSaveFunction(sortableListElem);
      },
    };

    merge(options, sortableOptions);

    let sortableGroupName = sortableListElem.getAttribute("sortable");
    if (sortableGroupName) {
      options.group = sortableGroupName;
    }

    if (sortableListElem.querySelector("[sortable-handle]")) {
      options.handle = "[sortable-handle]";
    }

    sortablejs.create(sortableListElem, options);
  });
}


