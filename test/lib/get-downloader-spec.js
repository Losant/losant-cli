const {
  nock, sinon, unlockConfigFiles, buildResourceConfig,
  buildConfig, printTable, statusExpHeaders
} = require('../common');
const ssLog = require('single-line-log');
const { defer } = require('omnibelt');
const getDownloader = require('../../lib/get-downloader');
const getStatusFunc = require('../../lib/get-status-func');
const {
  experience: {
    apiType: API_TYPE,
    commandType: COMMAND_TYPE,
    localStatusParams: LOCAL_STATUS_PARAMS,
    remoteStatusParams: REMOTE_STATUS_PARAMS
  }
} = require('../../lib/constants');
const {
  experience: EXP_DOWNLOAD_PARAMS
} = require('../../lib/get-download-params');
const { writeFile, remove, ensureDirSync, readFile } = require('fs-extra');
const c = require('chalk');
const pad = require('pad');
const path = require('path');
const crypto = require('crypto');
const utils = require('../../lib/utils');

const nockExperienceView = (items, numNocks = 1) => {
  for (let i = 0; i < numNocks; i++) {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: items.length,
        items
      });
  }
};

let stdoutSpy;
let msgs = [];
const restoreLogs = () => {
  if (stdoutSpy) {
    stdoutSpy.restore();
  }
  msgs = [];
};
const getNextLogs = ({ numMsg = 1 } = {}) => {
  const deferred = defer();
  restoreLogs();
  stdoutSpy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
    msgs.push(message);
    if (msgs.length === numMsg) {
      deferred.resolve(msgs);

    }
  });
  return deferred;
};

describe('#getDownloader', () => {
  afterEach(() => {
    restoreLogs();
  });
  it('should try to download', async () => {
    nockExperienceView([
      {
        name: 'GET my/new/route',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca93',
        id: '5b92975dc2f8de0006e2ca93',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      }
    ], 4);

    const downloader = getDownloader(EXP_DOWNLOAD_PARAMS);

    await buildConfig();
    downloader.should.be.a.Function();
    let nextLog = getNextLogs({ numMsg: 2 });

    const command = {};
    await downloader(null, command);
    await unlockConfigFiles('.application.yml');
    let messages = await nextLog.promise;
    messages[0].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/GET mynewroute.hbs`);
    messages[1].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/GET mynewroute.hbs`);
    nextLog = getNextLogs();
    const getStatus = getStatusFunc({
      apiType: API_TYPE,
      commandType: COMMAND_TYPE,
      localStatusParams: LOCAL_STATUS_PARAMS,
      remoteStatusParams: REMOTE_STATUS_PARAMS
    });
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    messages = await nextLog.promise;
    messages[0].should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no') ]]
    ));
    nextLog = getNextLogs();
    await writeFile('./experience/layouts/GET mynewroute.hbs', 'write something else to make it modified...');
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    messages = await nextLog.promise;
    messages[0].should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.yellow('modified'), c.gray('unmodified'), c.gray('no') ]]
    ));
    nextLog = getNextLogs();
    await remove('./experience/layouts/GET mynewroute.hbs');
    await getStatus(command);
    await unlockConfigFiles('.application.yml');
    messages = await nextLog.promise;
    messages[0].should.equal(printTable(
      statusExpHeaders,
      [[ 'GET my/new/route', 'layout', c.red('deleted'), c.gray('unmodified'), c.gray('no') ]]
    ));
  });
  it('should handle downloading files with names that would be sanitized', async () => {
    const exps = [
      {
        name: '5b92975dc2f8de0006e2ca93',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca91',
        id: '5b92975dc2f8de0006e2ca91',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      },
      {
        name: 'my:View',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca92',
        id: '5b92975dc2f8de0006e2ca92',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      },
      {
        name: 'my::View',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca93',
        id: '5b92975dc2f8de0006e2ca93',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      },
      {
        name: 'my/View',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554e',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca94',
        id: '5b92975dc2f8de0006e2ca94',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      },
      {
        name: ':',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554f',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca95',
        id: '5b92975dc2f8de0006e2ca95',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      }
    ];
    nockExperienceView(exps);

    const downloader = getDownloader(EXP_DOWNLOAD_PARAMS);
    const command = {};
    await buildConfig();
    const nextLog = getNextLogs({ numMsg: 6 });
    await downloader(null, command);
    await unlockConfigFiles('.application.yml');
    const messages = await nextLog.promise;
    messages.length.should.equal(10);
    messages[0].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/5b92975dc2f8de0006e2ca93.hbs`);
    messages[1].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/5b92975dc2f8de0006e2ca93.hbs`);
    messages[2].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/myView.hbs`);
    messages[3].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/myView.hbs`);
    messages[4].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/myView-1.hbs`);
    messages[5].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/myView-1.hbs`);
    messages[6].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/myView-2.hbs`);
    messages[7].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/myView-2.hbs`);
    messages[8].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/${exps[4].id}.hbs`);
    messages[9].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/${exps[4].id}.hbs`);
  });
  it('should leave files that have previously been created locally', async () => {
    const localText =  'write something else to make it modified...';
    const exps = [
      {
        name: 'my:View',
        description: 'description',
        viewType: 'layout',
        body: 'a body',
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca93',
        id: '5b92975dc2f8de0006e2ca93',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      },
      {
        name: 'myOtherView',
        description: 'description',
        viewType: 'layout',
        body: localText,
        applicationId: '5b9297591fefb200072e554d',
        creationDate: '2018-09-07T15:21:01.223Z',
        lastUpdated: '2018-09-07T15:21:01.234Z',
        viewTags: {},
        experienceViewId: '5b92975dc2f8de0006e2ca90',
        id: '5b92975dc2f8de0006e2ca90',
        _type: 'experienceView',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
      }
    ];
    nockExperienceView(exps);

    const downloader = getDownloader(EXP_DOWNLOAD_PARAMS);
    const command = {};
    const md5 = crypto.createHash('md5')
      .update(localText, 'utf8')
      .digest('hex');
    await buildConfig();
    ensureDirSync(path.join(process.env.DIR, 'experience'));
    ensureDirSync(path.join(process.env.DIR, 'experience', 'layouts'));
    await writeFile(path.join(process.env.DIR, 'experience/layouts/my:View.hbs'), localText);
    await buildResourceConfig('experience.yml', {
      'experience/layouts/my:View.hbs': {
        file: 'experience/layouts/my:View.hbs',
        id: '5b92975dc2f8de0006e2ca93',
        md5,
        remoteTime: 1536333661234,
        localTime: 1536333661234
      },
      'experience/layouts/myOtherView.hbs': {
        file: 'experience/layouts/myOtherView.hbs',
        id: '5b92975dc2f8de0006e2ca90',
        md5,
        remoteTime: 1536333661234,
        localTime: 1536333661234
      }
    });
    const nextLog = getNextLogs({ numMsg: 3 });
    await downloader(null, command);
    await unlockConfigFiles('.application.yml');
    const messages = await nextLog.promise;
    messages[0].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/my:View.hbs`);
    messages[1].should.equal(`${pad(c.green('downloaded'), 13)}\texperience/layouts/my:View.hbs`);
    messages[2].should.equal(`${pad(c.gray('processing'), 13)}\texperience/layouts/myOtherView.hbs`);
    messages[3].should.equal(`${pad(c.gray('unmodified'), 13)}\texperience/layouts/myOtherView.hbs`);
    const layout = (await readFile(path.join(path.join(process.env.DIR, 'experience/layouts/my:View.hbs')))).toString();
    layout.should.equal('a body');

    const localMeta = await utils.loadLocalMeta('experience');
    Object.keys(localMeta).should.deepEqual([
      'experience/layouts/my:View.hbs',
      'experience/layouts/myOtherView.hbs'
    ]);
    localMeta['experience/layouts/my:View.hbs'].name.should.equal('my:View');
    localMeta['experience/layouts/my:View.hbs'].remoteTime.should.equal((new Date('2018-09-07T15:21:01.234Z')).getTime());
    localMeta['experience/layouts/myOtherView.hbs'].name.should.equal('myOtherView');
    localMeta['experience/layouts/myOtherView.hbs'].remoteTime.should.equal((new Date('2018-09-07T15:21:01.234Z')).getTime());
  });
});
