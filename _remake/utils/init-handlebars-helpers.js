import RemakeStore from "../lib/remake-store";
import { getUniqueId } from "../lib/get-unique-id";
import routeUtils from "../utils/route-utils";
const path = require("upath");

export function initHandlebarsHelpers({ Handlebars }) {
  const handlebarsHelpers = require("handlebars-helpers")();

  Handlebars.registerHelper(handlebarsHelpers);

  Handlebars.registerHelper("contains", function () {
    let haystack = Array.from(arguments);
    let options = haystack.pop();
    let needle = haystack.shift();

    if (haystack.includes(needle)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // this should be deprecated in a later version
  Handlebars.registerHelper("generateIdIfNone", function (id, uniqueMarker, options) {
    if (!options) {
      options = uniqueMarker;
      uniqueMarker = getUniqueId(); 
    }

    uniqueMarker = (uniqueMarker || "").replace(/\W/g, "_"); 
    return id || `__remake_unique_marker_${uniqueMarker}`;
  });

  Handlebars.registerHelper("checked", function (currentValue) {
    if (currentValue === "true" || currentValue === true) {
      return 'checked="checked"';
    } else {
      return "";
    }
  });


  Handlebars.registerHelper("for", function (context, options) {
    RemakeStore.addNewItemRenderFunction({
      name: options.hash.itemName,
      func: options.fn,
      appName: RemakeStore.isMultiTenant() ? this.appName : undefined,
    });

    if (!context || context.length === 0) {
      return options.inverse(this);
    }

    let overallRender = context
      .map(contextItem => {

        let data = {};
        if (options.hash.itemName) {
          data[options.hash.itemName] = contextItem;
        }

        let renderedItem = options.fn(data);

        return renderedItem;
      })
      .join("");

    return overallRender;
  });

  Handlebars.registerHelper("BaseRoute", function (options) {
    if (routeUtils.isBaseRoute(this.params)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper("UsernameRoute", function (options) {
    if (routeUtils.isUsernameRoute(this.params)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper("ItemRoute", function (options) {
    if (routeUtils.isItemRoute(this.params)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
}
