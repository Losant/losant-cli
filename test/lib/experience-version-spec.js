const { nock, sinon } = require('../common');
const ssLog = require('single-line-log');
const Table = require('cli-table3');
const printTable = (headers, columns) => {
  const table = new Table({ head: headers });

  table.push(...columns);

  return table.toString();
};
const versionCommand = require('../../lib/experience-version');
const c = require('chalk');
const pad = require('pad');

describe.only('#ExperienceVersion', function() {
  let spy;
  it('should print a table of versions', async () => {
    let message;
    spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    nock('https://api.losant.space:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/versions')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        count: 1,
        items:
         [
           {
             applicationId: '568beedeb436ab01007be53d',
             version: 'develop',
             endpointDefaultCors: true,
             creationDate: '2018-09-18T21:49:00.170Z',
             lastUpdated: '2018-09-18T21:49:00.195Z',
             experienceVersionId: '5ba172ccb4abff001661037b',
             id: '5ba172ccb4abff001661037b',
             attachedDomains: [
               { id: '59fa2e946130fd00072c786a',  domainName: 'mycustomguy.com' },
               { id: '59fa2e946130fd00072c786b',  domainName: 'anotherCustomMan.com' }
             ],
             attachedSlugs: [{ id: '5ba172cbb4abff0016610375', slug: 'embree' }],
             _type: 'experienceVersion'
           },
           {
             applicationId: '568beedeb436ab01007be53e',
             version: 'v1.0.0',
             endpointDefaultCors: false,
             creationDate: '2018-09-18T21:49:00.170Z',
             lastUpdated: '2018-09-18T21:49:00.195Z',
             experienceVersionId: '5ba172ccb4abff001661037a',
             id: '5ba172ccb4abff001661037b',
             attachedDomains: [
               { id: '59fa2e946130fd00072c786c',  domainName: 'domain.com' },
               { id: '59fa2e946130fd00072c786bd',  domainName: 'domaain1.com' },
               { id: '59fa2e946130fd00072c786be',  domainName: '*wildcard.com' }
             ],
             attachedSlugs: [],
             _type: 'experienceVersion'
           }
         ],
        applicationId: '568beedeb436ab01007be53d',
        perPage: 100,
        page: 0,
        sortField: 'version',
        sortDirection: 'asc',
        totalCount: 1,
        _type: 'experienceVersions',
        _links:
         {
           self:
            { href: '/applications/568beedeb436ab01007be53d/experience/versions' }
         }
      }
      );
    const command = { config: './fixtures/losant.yaml' };

    await versionCommand(null, command);
    message.should.equal(printTable(
      [ 'version', 'endpointDefaultCors', 'attachedDomains', 'attachedSlugs', 'creationDate', 'lastUpdated' ],
      [ [ 'develop',
        true,
        'mycustomguy.com, anotherCustomMan.com',
        'embree',
        '2018-09-18T21:49:00.170Z',
        '2018-09-18T21:49:00.195Z' ],
      [ 'v1.0.0',
        false,
        'domain.com, domaain1.com, *wildcard.com',
        '',
        '2018-09-18T21:49:00.170Z',
        '2018-09-18T21:49:00.195Z'
      ]
      ]
    ));
  });

  it('should create a new version', async () => {
    let message;
    spy = sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    const createCall = nock('https://api.losant.space:443', { encodedQueryParams: true })
      .post('/applications/5b9297591fefb200072e554d/experience/versions')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        version: 'v1.0.0',
        description: 'The first version'
      });

    const createDomainCall = nock('https://api.losant.space:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/domains')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        items: []
      });

    const createSlugCall = nock('https://api.losant.space:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/slugs')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        items: []
      });

    const command = { config: './fixtures/losant.yaml', description: 'The first version'  };

    await versionCommand('v1.0.0', command);

    createDomainCall.isDone().should.be.true();
    createSlugCall.isDone().should.be.true();
    createCall.isDone().should.be.true();
    message.should.equal(`${pad(c.gray('CREATED : '), 13)}\tv1.0.0`);
  });
});
