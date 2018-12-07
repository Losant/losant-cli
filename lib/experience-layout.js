const {
  loadConfig,
  log,
  logResult
} = require('./utils');
const inquirer = require('inquirer');
const getApi = require('./get-api');
const paginate = require('./paginate-request');
const printTable = require('./print-table');

const VIEW_HEADERS = [ 'Page Name', 'Layout Name' ];

module.exports = async (page, command) => {
  const { apiToken, applicationId } = await loadConfig();
  if (!applicationId || !apiToken) { return; } // config did not lock or did not load correctly.
  const api = await getApi({ apiToken });

  if (!page) {
    const pages = await paginate(api.experienceViews.get, { applicationId, viewType: 'page' }, { filter: command.pattern });
    if (!pages.length) {
      return log('No pages were found for this application.');
    }
    const columns = [];
    pages.forEach((item) => {
      const column = [];
      column.push(item.name);
      column.push(item.layoutName || 'unset');
      columns.push(column);
    });
    return printTable(VIEW_HEADERS, columns);
  } else {
    const layoutsPromise = paginate(api.experienceViews.get, { applicationId, viewType: 'layout' });
    const pageInfos = await paginate(api.experienceViews.get, { applicationId, filter: page, filterField: 'name', viewType: 'page' });
    let pageInfo;
    if (pageInfos.length === 1) {
      pageInfo = pageInfos[0];
    } else {
      const pageToInfo = {};
      const choices = pageInfos.map((info) => {
        const key = `${info.name} https://app.losant.com/applications/${applicationId}/experience/versions/develop/views/layouts/${info.id}`;
        pageToInfo[key] = info;
        return key;
      });
      const { pageKey } = await inquirer.prompt([{
        type: 'list',
        name: 'pageKey',
        message: `More than one page came up with the name ${page}, please choose of the following pages:`,
        choices
      }]);
      pageInfo = pageToInfo[pageKey];
    }
    if (!pageInfo) {
      return log(`No page found by the name of ${page}`);
    }
    const layouts = await layoutsPromise;
    const keyToId = {};
    const choices = layouts.map(({ id, name }) => {
      const key = `${name} https://app.losant.com/applications/${applicationId}/experience/versions/develop/views/layouts/${id}`;
      keyToId[key] = id;
      return name;
    });
    const { name } = await inquirer.prompt([{
      type: 'list',
      name: 'name',
      message: 'Choose one of the following layouts:',
      choices
    }]);
    const result = await api.experienceView.patch({ applicationId, experienceViewId: pageInfo.id }, { layoutId: keyToId[name] });
    logResult('Complete', `${pageInfo.name} is now using the layout "${result.layoutName}"`, 'green');
  }
};
