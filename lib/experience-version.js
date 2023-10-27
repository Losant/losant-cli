const inquirer = require('inquirer');
const {
  capitalize, keys, compact, map, trim, isNotNil
} = require('omnibelt');
const { loadConfig, logResult, logError, log } = require('./utils');
const moment = require('moment');
const c = require('chalk');
const formatDate = (date) => {
  return moment(date).format('MMM DD YYYY HH:mm');
};

const mapTrim = map(trim);

const listVersions = async (api, applicationId, filter, endpointDomain) => {
  const query = { applicationId };
  if (filter) {
    query.filterField = 'version';
    query.filter = filter;
  }
  const data = await api.experienceVersions.get(query);
  let printStr = '';
  data.items.forEach((item = {}) => {
    if (printStr) {
      printStr += '---------------------------\n\n';
    }
    printStr += `Version Name: ${c.cyan.bold(item.version)}\n`;
    printStr += `Creation Date: ${formatDate(item.creationDate)}\n`;
    const attachedDomains = item.attachedDomains ? compact(item.attachedDomains.map((config) => {
      if (config.domainName) {
        return `${config.domainName}`;
      }
    })).join('\n') : '';
    const attachedSlugs = item.attachedSlugs ? compact(item.attachedSlugs.map((config) => {
      if (config.slug) {
        return `${config.slug}.${endpointDomain}`;
      }
    })).join('\n') : '';
    const domains = attachedSlugs + attachedDomains;
    if (domains) {
      printStr += `\nDomains:\n${domains}`;
    } else {
      printStr += `\n${c.keyword('lightcoral')('No domains are currently attached to this version.')}`;
    }
    printStr += '\n';
  });
  if (printStr) {
    return log(printStr);
  } else {
    // should never happen, but let's put some context if it does
    if (!filter) {
      return logError(`No versions found for application ${applicationId}`);
    } else {
      return logError(`No versions found for application ${applicationId} matching ${filter}`);
    }
  }
};


const createVersion = async (api, applicationId, version, options) => {
  const post = { applicationId, experienceVersion: { version } };
  if (options.description) { post.experienceVersion.description = options.description; }
  if (options.domainIds) { post.experienceVersion.domainIds = options.domainIds; }
  if (options.slugIds) { post.experienceVersion.slugIds = options.slugIds; }
  try {
    await api.experienceVersions.post(post);
    logResult('created', `${version}`, 'green');
  } catch (e) {
    logError(e);
  }
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

const promptForSlugsAndDomains = async (api, applicationId) => {
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
  let domainIds = [], slugIds = [];
  if (questions.length) {
    const { domains, slugs } = await inquirer.prompt(questions) || {};
    if (domains?.length) {
      domainIds = domains.map((domain) => domainChoiceMappings[domain]);
    }
    if (slugs?.length) {
      slugIds = slugs.map((slug) => slugChoiceMappings[slug]);
    }
  }
  return { domainIds, slugIds };
};

module.exports = async (version, opts = {}) => {
  const { apiToken, applicationId, api, endpointDomain } = await loadConfig();
  if (!applicationId || !apiToken) { return; } // config did not lock or did not load correctly.
  if (!version) {
    await listVersions(api, applicationId, opts.list, endpointDomain);
  } else {
    const versionInfo = { description: opts.description };
    if (isNotNil(opts.slugIds) || isNotNil(opts.domainIds)) {
      versionInfo.slugIds = opts.slugIds?.length ? mapTrim(opts.slugIds.split(',')) : [];
      versionInfo.domainIds = opts.domainIds?.length ? mapTrim(opts.domainIds.split(',')) : [];
    } else {
      const selected = await promptForSlugsAndDomains(api, applicationId);
      versionInfo.domainIds = selected.domainIds;
      versionInfo.slugIds = selected.slugIds;
    }
    await createVersion(api, applicationId, version, versionInfo);
  }
};
