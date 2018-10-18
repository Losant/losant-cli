const getApi = require('./get-api');
const inquirer = require('inquirer');
const { capitalize, keys, props, propOr } = require('omnibelt');
const { setDir, loadConfig, logResult } = require('./utils');
const printTable = require('./print-table');

const VERSION_HEADERS = [ 'version', 'endpointDefaultCors', 'attachedDomains', 'attachedSlugs', 'creationDate', 'lastUpdated' ];
const getVersionColumn = props(VERSION_HEADERS);

const listVersions = async (api, applicationId, filter) => {
  const query = { applicationId };
  if (filter) { query.filter = filter; }
  const data = await api.experienceVersions.get(query);
  const columns = data.items.map((item) => {
    if (item.attachedDomains) {
      item.attachedDomains = (item.attachedDomains.map(propOr('', 'domainName'))).join(', ');
    }
    if (item.attachedSlugs) {
      item.attachedSlugs = (item.attachedSlugs.map(propOr('', 'slug'))).join(', ');
    }
    const column = getVersionColumn(item);
    return column;
  });
  printTable(VERSION_HEADERS, columns);
};


const createVersion = async (api, applicationId, version, options) => {
  const post = { applicationId, experienceVersion: { version } };
  if (options.description) { post.experienceVersion.description = options.description; }
  if (options.domainIds) { post.experienceVersion.domainIds = options.domainIds; }
  if (options.slugIds) { post.experienceVersion.slugIds = options.slugIds; }
  // TODO make a wrapper to handle all erros on the api!
  await api.experienceVersions.post(post);
  logResult('CREATED : ', `${version}`);
};

const getExperiencePart = async (api, type, query) => {
  return (await api[`experience${capitalize(type)}s`].get(query)).items;
};

const choices = (nameField, versionField, datas) => {
  const mapping = {};
  datas.forEach((data) => {
    mapping[`${data[nameField]} (current version: ${data[versionField]})`] = data.id;
  });
  return mapping;
};

module.exports = async (version, command) => {
  setDir(command);
  const { apiToken, applicationId } = await loadConfig(command.config);
  const api = await getApi({ apiToken });
  if (!version) {
    await listVersions(api, applicationId, command.list);
  } else {
    const domainChoiceMappings = choices('domainName', 'version', await getExperiencePart(api, 'domain', { applicationId }));
    const domainChoices = keys(domainChoiceMappings);
    const slugChoiceMappings = choices('slug', 'version', await getExperiencePart(api, 'slug', { applicationId }));
    const slugChoices = keys(slugChoiceMappings);
    const questions = [];
    if (domainChoices.length) {
      questions.push({ type: 'checkbox', name: 'domains', message: 'Select Experience Domains to point at this version', choices: domainChoices });
    }
    if (slugChoices.length) {
      questions.push({ type: 'checkbox', name: 'slugs', message: 'Select Experience Slugs to point at this version', choices: slugChoices });
    }
    let domainIds, slugIds;
    if (questions.length) {
      const { domains, slugs } = await inquirer.prompt(questions) || {};
      if (domains) {
        domainIds = domains.map((domain) => domainChoiceMappings[domain]);
      }
      if (slugs) {
        slugIds = slugs.map((slug) => slugChoiceMappings[slug]);
      }
    }
    await createVersion(api, applicationId, version, { description: command.description, domainIds, slugIds });
  }
};
