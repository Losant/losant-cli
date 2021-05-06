const { nock, sinon, buildConfig } = require('../common');
const ssLog = require('single-line-log');
const versionCommand = require('../../lib/experience-version');
const c = require('chalk');

describe('#ExperienceVersion', function() {
  it('should print a table of versions', async () => {
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    nock('https://api.losant.com:443', { encodedQueryParams: true })
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
               { id: '59fa2e946130fd00072c786a', domainName: 'mycustomguy.com' },
               { id: '59fa2e946130fd00072c786b', domainName: 'anotherCustomMan.com' }
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
               { id: '59fa2e946130fd00072c786c', domainName: 'domain.com' },
               { id: '59fa2e946130fd00072c786bd', domainName: 'domain1.com' },
               { id: '59fa2e946130fd00072c786be', domainName: '*wildcard.com' }
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
      });

    await buildConfig();

    await versionCommand(null, {});
    let versionPrint = `Version Name: ${c.cyan.bold('develop')}\nCreation Date: Sep 18 2018 17:49\n\nDomains:\nembree.on.losant.commycustomguy.com\nanotherCustomMan.com\n`;
    versionPrint += '---------------------------\n\n';
    versionPrint += `Version Name: ${c.cyan.bold('v1.0.0')}\nCreation Date: Sep 18 2018 17:49\n\nDomains:\ndomain.com\ndomain1.com\n*wildcard.com\n`;
    message.should.equal(versionPrint);
  });

  it('should create a new version', async () => {
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    const createCall = nock('https://api.losant.com:443', { encodedQueryParams: true })
      .post('/applications/5b9297591fefb200072e554d/experience/versions')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        version: 'v1.0.0',
        description: 'The first version'
      });

    const createDomainCall = nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/domains')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        items: []
      });

    const createSlugCall = nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/slugs')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        items: []
      });
    await buildConfig();
    const command = { description: 'The first version' };

    await versionCommand('v1.0.0', command);

    createDomainCall.isDone().should.be.true();
    createSlugCall.isDone().should.be.true();
    createCall.isDone().should.be.true();
    message.should.equal(`${c.green('created')}\tv1.0.0`);
  });
});
