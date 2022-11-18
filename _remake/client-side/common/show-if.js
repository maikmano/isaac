
export default function processShowIfAttributes() {
  var showIfElems = Array.from(document.querySelectorAll("[show-if],[flex-show-if]"));

  var filterOutProcessed = showIfElems.filter(el => !el._processedByShowIf);


  var keyValuesStrings = [];
  filterOutProcessed.forEach(el => {
    if (el.hasAttribute("show-if")) {
      keyValuesStrings = keyValuesStrings.concat(el.getAttribute("show-if").split(" "));
    }
    if (el.hasAttribute("flex-show-if")) {
      keyValuesStrings = keyValuesStrings.concat(el.getAttribute("flex-show-if").split(" "));
    }
    el._processedByShowIf = true;
  });

  var uniqueValues = Array.from(new Set(keyValuesStrings));

  if (uniqueValues.length) {

    var keysAndValuesSeparate = uniqueValues.map(str => str.split("="));
    var showIfStyles = keysAndValuesSeparate
      .map(
        val =>
          `[key\\:${val[0]}="${val[1]}"] [show-if~="${val[0]}=${val[1]}"], [temporary\\:key\\:${val[0]}="${val[1]}"] [show-if~="${val[0]}=${val[1]}"] {display: block;} `
      )
      .join("");
    showIfStyles += showIfStyles.replace(/show-if/g, "flex-show-if").replace(/block/g, "flex");
    var styleHtml = `<style>[show-if], [flex-show-if] {display: none;} ${showIfStyles}</style>`;
    document.head.insertAdjacentHTML("beforeend", styleHtml);
  }
}
