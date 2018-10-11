const losant = require('losant-rest');
const inquirer = require('inquirer');
const { capitalize, keys, props, propOr } = require('omnibelt');
const { setDir, loadConfig } = require('./utils');
const printTable = require('./table-printer');

const VERSION_HEADERS = [ 'version', 'endpointDefaultCors', 'attachedDomains', 'attachedSlugs', 'creationDate', 'lastUpdated' ];
const getVersionColumn = props(VERSION_HEADERS);

const listVersions = async (api, applicationId, filter) => {
  const query = { applicationId };
  if (filter) { query.filter = filter; }
  const data = await api.experienceVersions.get(query);
  if (!data.totalCount) {
    console.log('No versions have been created for your Experience, it looks like you have not saved an Experience yet.');
  }
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
  console.log(api.experienceVersions);
  // TODO make a wrapper to handle all erros on the api!
  return await api.experienceVersions.get({ applicationId });
  const data = await api.experienceVersions.post(post);
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
  const api = losant.createClient({ accessToken: apiToken, url: 'https://api.losant.space' });
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
    const promptResults = await inquirer.prompt(questions);
    const domainIds = promptResults.domains.map((domain) => domainChoiceMappings[domain]);
    const slugIds = promptResults.slugs.map((slug) => slugChoiceMappings[slug]);
    const result = await createVersion(api, applicationId, version, { description: command.description, domainIds, slugIds });
  }
};
