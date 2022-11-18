import { getUniqueId } from "../lib/get-unique-id";


export function getHtmlWithUniqueIds({ htmlString }) {
  let idExpressions = htmlString.match(/__remake_unique_marker_\w*/gi) || [];
  let idVariablesUnique = [...new Set(idExpressions)];
  let idVariableToIdArray = idVariablesUnique.map(idVar => ({ name: idVar, id: getUniqueId() }));
  idVariableToIdArray.forEach(idVarMap => {
    htmlString = htmlString.replace(new RegExp(idVarMap.name, "g"), idVarMap.id);
  });
  return htmlString;
}
