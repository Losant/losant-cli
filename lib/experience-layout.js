const {
  loadConfig,
  log,
  logResult,
  logError
} = require('./utils');
const inquirer = require('inquirer');
const paginate = require('./paginate-request');
const printTable = require('./print-table');
const allSettledSerial = require('./all-settled-serial-p');
const { trim } = require('omnibelt');
const c = require('chalk');
const VIEW_HEADERS = [ 'Page Name', 'Layout Name' ];

module.exports = async (page, command) => {
  const { apiToken, applicationId, api, appUrl } = await loadConfig();
  if (!applicationId || !apiToken) { return; } // config did not lock or did not load correctly.
  const pageQuery = { applicationId, viewType: 'page' };
  if (page || command.pattern) {
    pageQuery.filterField = 'name';
    pageQuery.filter = page || command.pattern;
  }
  const pagesPromise = paginate(api.experienceViews.get, pageQuery);

  if (!page) {
    const pages = await pagesPromise;
    if (!pages.length) {
      return log('No pages were found for this application.');
    }
    const columns = [];
    pages.forEach((item) => {
      const column = [];
      column.push(item.name);
      column.push(item.layoutName || c.blue('no layout'));
      columns.push(column);
    });
    return printTable(VIEW_HEADERS, columns);
  } else {
    const layoutsPromise = paginate(api.experienceViews.get, { applicationId, viewType: 'layout' });
    let pageInfos = await pagesPromise;
    if (!pageInfos.length) {
      return log(`No pages found that match the name "${page}".`);
    }
    if (pageInfos.length === 1) {
      log(`Only one page found that matched ${page}, ${pageInfos[0].name} ${appUrl}/applications/${applicationId}/experience/versions/develop/views/pages/${pageInfos[0].id}`);
    }
    if (pageInfos.length > 1) {
      const pageToInfo = {};
      const choices = pageInfos.map((info) => {
        // intentional, cause inquirer leaves no room in between the bullet point and the name, the space is important.
        const key = ` ${info.name} ${appUrl}/applications/${applicationId}/experience/versions/develop/views/pages/${info.id}`;
        pageToInfo[trim(key)] = info;
        return key;
      });
      const { pageKey } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'pageKey',
        message: `More than one page came up with the name ${page}, please select which page(s) to update:`,
        choices
      }]);
      pageInfos = pageKey.map((key) => {
        return pageToInfo[key];
      });
      if (!pageInfos.length) {
        return log('No page selected.');
      }
    }
    const layouts = await layoutsPromise;
    const keyToId = {};
    const choices = layouts.map(({ id, name }) => {
      const key = `${name} ${appUrl}/applications/${applicationId}/experience/versions/develop/views/layouts/${id}`;
      keyToId[key] = id;
      return key;
    });
    choices.push('no layout');
    keyToId['no layout'] = null;
    const { name } = await inquirer.prompt([{
      type: 'list',
      name: 'name',
      message: 'Choose one of the following layouts:',
      choices
    }]);

    await allSettledSerial(async (info) => {
      try {
        const result = await api.experienceView.patch({ applicationId, experienceViewId: info.id, experienceView: { layoutId: keyToId[name] } });
        let message;
        if (!keyToId[name]) {
          message = `${info.name} no longer has a layout set.`;
        } else {
          message = `${info.name} is now using the layout "${result.layoutName}".`;
        }
        logResult('Complete', message, 'green');
      } catch (e) {
        const message = `Error occurred when trying to update page ${info.name} with message ${e.message}`;
        logError(message);
      }
    }, pageInfos);
  }
};
