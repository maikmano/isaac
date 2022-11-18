const _ = require("lodash");
const Handlebars = require("handlebars");
import { getItemWithId } from "./get-item-with-id";
import { specialDeepExtend } from "./special-deep-extend";
import { setUserData } from "./user-data";
import { capture } from "../utils/async-utils";
import RemakeStore from "./remake-store";

export function initApiSave({ app }) {

  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/save/, async (req, res) => {
    if (!req.isAuthenticated()) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let { username, pageName, itemId } = req.urlData.pageParams;

    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;

    if (!incomingData) {
      res.json({ success: false, reason: "noIncomingData" });
      return;
    }

    let currentUser = req.user;
    let isPageAuthor = currentUser && username && currentUser.details.username === username;
    let existingData = currentUser.appData;

    if (!isPageAuthor) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    if (savePath) {
      let dataAtPath = _.get(existingData, savePath);

      if (_.isPlainObject(dataAtPath)) {

        specialDeepExtend(dataAtPath, incomingData);
        _.set(existingData, savePath, incomingData);
      } else if (Array.isArray(dataAtPath)) {
        specialDeepExtend(dataAtPath, incomingData);
        _.set(existingData, savePath, incomingData);
      } else {

        _.set(existingData, savePath, incomingData);
      }

    } else if (saveToId) {
      let itemData = getItemWithId(existingData, saveToId);

      if (!itemData) {
        res.json({ success: false, reason: "noItemFound" });
        return;
      }

      specialDeepExtend(itemData, incomingData);
      Object.assign(itemData, incomingData);

    } else {
      specialDeepExtend(existingData, incomingData);
      existingData = incomingData;
    }

    let [setUserDataResponse, setUserDataError] = await capture(
      setUserData({ appName: req.appName, username, data: existingData, type: "appData" })
    );

    if (setUserDataError) {
      res.json({ success: false, reason: "userData" });
      return;
    }

    res.json({ success: true });
  });
}
