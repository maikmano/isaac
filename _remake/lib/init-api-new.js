import lodash from 'lodash';
import deepdash from 'deepdash';
const Handlebars = require("handlebars");
const JSDOM = require("jsdom").JSDOM;
import { getUniqueId } from "./get-unique-id";
import { getUserData } from "./user-data";
import { getParams } from "../utils/get-params";
import { getPartial } from "../utils/get-partials";
import { capture } from "../utils/async-utils";
import { processData } from "../utils/process-data";
import { showConsoleError } from "../utils/console-utils";
import { getBootstrapData } from "../utils/get-bootstrap-data";
import { getQueryParams } from "../utils/get-query-params";
import { getHtmlWithUniqueIds } from "../utils/get-html-with-unique-ids";
import { getSaveData } from "../client-side/get-save-data";
import RemakeStore from "./remake-store";
import { setValueForClosestKey } from '../client-side/data-utilities';

const _ = deepdash(lodash);

export function initApiNew({ app }) {
  // route for "/new" and "/app_*/new"
  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/new/, async (req, res) => {
    if (!req.isAuthenticated()) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let appName = req.appName;
    let partialName = req.body.templateName;
    let params = req.urlData.pageParams;
    let { username, pageName, itemId } = params;

    let partialRenderFunc = RemakeStore.getNewItemRenderFunction({ appName, name: partialName });

    if (!partialRenderFunc) {
      let [partialFileString] = await capture(getPartial({ appName, partialName }));

      if (partialFileString) {
        partialRenderFunc = Handlebars.compile(partialFileString);
      }
    }

    if (!partialRenderFunc) {
      showConsoleError(`Error: Couldn't find a template or partial named "${partialName}"`);
      res.json({ success: false, reason: "noItemTemplateFound" });
      return;
    }

    let query = getQueryParams({ req, fromReferrer: true });
    let pathname = req.urlData.referrerUrlPathname;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({ appName, username }));

    if (pageAuthorError) {
      res.json({ success: false, reason: "userData" });
      return;
    }

    if (username && !pageAuthor) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let data = (pageAuthor && pageAuthor.appData) || {};
    let isPageAuthor =
      currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;

    if (!isPageAuthor) {
      res.json({ success: false, reason: "notAuthorized" });
      return;
    }

    let [itemData] = await capture(
      processData({ appName, res, pageAuthor, data, params, requestType: "ajax" })
    );
    let { currentItem, parentItem } = itemData;

    let tempHtmlString = partialRenderFunc({});
    let domFromString = new JSDOM(tempHtmlString);
    let saveData = getSaveData(domFromString.window.document.body);
    let saveDataNested = {};
    saveDataNested[partialName] = saveData;

    let [partialBootstrapData] = await capture(
      getBootstrapData({ appName, fileName: partialName })
    );
    let newItemData = _.merge(saveDataNested, partialBootstrapData);

    _.forEachDeep(newItemData, function (value, key, parentValue, context) {
      if (_.isPlainObject(value)) {
        value.id = getUniqueId();
      }
    });

    let htmlString = partialRenderFunc({
      ...data,
      ...newItemData,
      params,
      query,
      pathname,
      currentItem,
      parentItem,
      currentUser,
      pageAuthor,
      isPageAuthor,
      pageHasAppData: !!pageAuthor,
    });

    let htmlStringWithUniqueIds = getHtmlWithUniqueIds({ htmlString });

    res.json({ success: true, htmlString: htmlStringWithUniqueIds });
  });
}
