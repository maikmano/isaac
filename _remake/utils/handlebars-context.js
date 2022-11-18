const Handlebars = require("handlebars");
import RemakeStore from "../lib/remake-store";
import { initHandlebarsHelpers } from "./init-handlebars-helpers";

export function getHandlebarsContext({ appName, regenerate }) {
  initHandlebarsHelpers({ Handlebars });

  return Handlebars;
}
