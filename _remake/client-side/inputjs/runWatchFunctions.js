export default function runWatchFunctions() {

  let watchElems = Array.from(document.querySelectorAll("[run\\:watch]"));
  Remake.callWatchFunctionsOnElements(watchElems);
}
