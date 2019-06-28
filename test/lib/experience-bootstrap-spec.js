const {
  nock,
  sinon,
  buildConfig,
  downloadLog,
  processingLog
} = require('../common');
const bootstrap = require('../../lib/experience-bootstrap');
const ssLog = require('single-line-log');
const c = require('chalk');
const pad = require('pad');
const inquirer = require('inquirer');

describe('#ExperienceBootstrap', () => {
  it('should skip bootstrapping when skipping and confirming with a no', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        id: '5b9297591fefb200072e554d',
        applicationId: '5b9297591fefb200072e554d',
        name: 'Test Application',
        ftueTracking: [{
          name: 'experience',
          status: 'skipped',
          version: 2
        }],
        endpointSlug: 'aSlug'
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((msg) => {
      message = msg;
    });
    sinon.stub(inquirer, 'prompt').callsFake(() => {
      return Promise.resolve({ shouldBootstrap: false });
    });
    await buildConfig();
    await bootstrap();
    message.should.equal(`${pad(c.yellow('Skip'), 13)}\tBootstrapping for this application Test Application.`);
  });
  it('should not bootstrap if it has already been completed', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        id: '5b9297591fefb200072e554d',
        applicationId: '5b9297591fefb200072e554d',
        name: 'Test Application',
        ftueTracking: [{
          name: 'experience',
          status: 'completed',
          version: 2
        }],
        endpointSlug: 'aSlug'
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((msg) => {
      message = msg;
    });
    await buildConfig();
    await bootstrap();
    message.should.equal(`${pad(c.yellow('Cannot Complete'), 13)}\tBootstrapping has already been completed for Test Application`);
  });
  it('should log out that pages were downloaded and bootstrapping completed', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        id: '5b9297591fefb200072e554d',
        applicationId: '5b9297591fefb200072e554d',
        name: 'Test Application',
        endpointSlug: 'aSlug'
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000' })
      .reply(200, {
        count: 6,
        items: [{
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: "<!doctype html>\n<!--[if lt IE 7]>      <html class=\"lt-ie9 lt-ie8 lt-ie7\" lang=\"\"> <![endif]-->\n<!--[if IE 7]>         <html class=\"lt-ie9 lt-ie8\" lang=\"\"> <![endif]-->\n<!--[if IE 8]>         <html class=\"lt-ie9\" lang=\"\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=\"\"> <!--<![endif]-->\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name=\"description\" content=\"{{section 'metaDescription'}}\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n    <link rel=\"icon\" type=\"image/x-icon\" href=\"https://app.losant.com/images/embree/favicon.ico\" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class=\"navbar navbar-default\" role=\"navigation\" style=\"border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;\">\n      <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"/\" style=\"padding-top:0; padding-bottom:0;\">\n            <img alt=\"Logo\" style=\"margin-top:13px; height: 24px;\" src=\"https://app.losant.com/images/embree/embree_sm.png\">\n          </a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav navbar-left\">\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n          </ul>\n          {{component \"userIndicator\"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style=\"text-align:center\">&copy; {{currentDateTime 'YYYY'}}. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    {{component \"gaTracking\" \"UA-XXXXX-X\"}}\n  </body>\n</html>", createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.238Z', lastUpdated: '2018-12-10T23:17:22.244Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa37', id: '5c0ef40213bed00009ebaa37', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa37' } }
        }, {
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the endpoint that renders this template, we redirect to the Login page if the experience user is not logged in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5c0ef40213bed00009ebaa37', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.478Z', lastUpdated: '2018-12-10T23:17:22.495Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa3b', id: '5c0ef40213bed00009ebaa3b', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa3b' } }
        }, {
          name: 'Log In', description: 'Users who are not logged in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '5c0ef40213bed00009ebaa37', body: '{{#fillSection "metaDescription"}}This is an example login page for your application experience.{{/fillSection}}\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="https://app.losant.com/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example <a target="_blank" href="https://docs.losant.com/experiences/views/#layouts">Layout</a>, <a target="_blank" href="https://docs.losant.com/experiences/views/#pages">Pages</a>, and <a target="_blank" href="https://docs.losant.com/experiences/views/#components">Components</a>\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email">Email address</label>\n          <input autofocus required value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input required minlength="8" maxlength="255" type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.424Z', lastUpdated: '2018-12-10T23:17:22.448Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa39', id: '5c0ef40213bed00009ebaa39', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa39' } }
        }, {
          name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">{{.}}</div>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.180Z', lastUpdated: '2018-12-10T23:17:22.186Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa31', id: '5c0ef40213bed00009ebaa31', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa31' } }
        }, {
          name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.202Z', lastUpdated: '2018-12-10T23:17:22.204Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa33', id: '5c0ef40213bed00009ebaa33', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa33' } }
        }, {
          name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login">Log In</a></li>\n  {{/if}}\n</ul>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.220Z', lastUpdated: '2018-12-10T23:17:22.223Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa35', id: '5c0ef40213bed00009ebaa35', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa35' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 6,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .patch('/applications/5b9297591fefb200072e554d/experience/bootstrap', {})
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, { resourceSuffix: 'aSuffix', password: 'yp926mfr6a', email: 'test.user.yp926mfr6a@example.com' }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:22 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '88',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);

    const messages = [];
    sinon.stub(ssLog, 'stdout').callsFake((msg) => {
      messages.push(msg);
    });
    await buildConfig();
    await bootstrap();
    messages.should.deepEqual([
      processingLog('experience/layouts/Example Layout.hbs'),
      downloadLog('experience/layouts/Example Layout.hbs'),
      processingLog('experience/pages/Home Page.hbs'),
      downloadLog('experience/pages/Home Page.hbs'),
      processingLog('experience/pages/Log In.hbs'),
      downloadLog('experience/pages/Log In.hbs'),
      processingLog('experience/components/errorAlert.hbs'),
      downloadLog('experience/components/errorAlert.hbs'),
      processingLog('experience/components/gaTracking.hbs'),
      downloadLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/userIndicator.hbs'),
      downloadLog('experience/components/userIndicator.hbs'),
      `${pad(c.gray('Experience URL'), 13)}\thttps://aSlug.on.losant.com/aSuffix`,
      `${pad(c.gray('Bootstrap Username'), 13)}\ttest.user.yp926mfr6a@example.com`,
      `${pad(c.gray('Bootstrap Password'), 13)}\typ926mfr6a`,
      `${pad(c.green('Completed'), 13)}\tBootstrapping has been successful.`
    ]);
  });

  it('should bootstrap even if skipped', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        id: '5b9297591fefb200072e554d',
        applicationId: '5b9297591fefb200072e554d',
        name: 'Test Application',
        ftueTracking: [{
          name: 'experience',
          status: 'skipped',
          version: 2
        }],
        endpointSlug: 'aSlug'
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000' })
      .reply(200, {
        count: 6,
        items: [{
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: "<!doctype html>\n<!--[if lt IE 7]>      <html class=\"lt-ie9 lt-ie8 lt-ie7\" lang=\"\"> <![endif]-->\n<!--[if IE 7]>         <html class=\"lt-ie9 lt-ie8\" lang=\"\"> <![endif]-->\n<!--[if IE 8]>         <html class=\"lt-ie9\" lang=\"\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=\"\"> <!--<![endif]-->\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name=\"description\" content=\"{{section 'metaDescription'}}\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n    <link rel=\"icon\" type=\"image/x-icon\" href=\"https://app.losant.com/images/embree/favicon.ico\" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class=\"navbar navbar-default\" role=\"navigation\" style=\"border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;\">\n      <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"/\" style=\"padding-top:0; padding-bottom:0;\">\n            <img alt=\"Logo\" style=\"margin-top:13px; height: 24px;\" src=\"https://app.losant.com/images/embree/embree_sm.png\">\n          </a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav navbar-left\">\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n          </ul>\n          {{component \"userIndicator\"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style=\"text-align:center\">&copy; {{currentDateTime 'YYYY'}}. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    {{component \"gaTracking\" \"UA-XXXXX-X\"}}\n  </body>\n</html>", createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.238Z', lastUpdated: '2018-12-10T23:17:22.244Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa37', id: '5c0ef40213bed00009ebaa37', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa37' } }
        }, {
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the endpoint that renders this template, we redirect to the Login page if the experience user is not logged in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5c0ef40213bed00009ebaa37', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.478Z', lastUpdated: '2018-12-10T23:17:22.495Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa3b', id: '5c0ef40213bed00009ebaa3b', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa3b' } }
        }, {
          name: 'Log In', description: 'Users who are not logged in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '5c0ef40213bed00009ebaa37', body: '{{#fillSection "metaDescription"}}This is an example login page for your application experience.{{/fillSection}}\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="https://app.losant.com/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example <a target="_blank" href="https://docs.losant.com/experiences/views/#layouts">Layout</a>, <a target="_blank" href="https://docs.losant.com/experiences/views/#pages">Pages</a>, and <a target="_blank" href="https://docs.losant.com/experiences/views/#components">Components</a>\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email">Email address</label>\n          <input autofocus required value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input required minlength="8" maxlength="255" type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.424Z', lastUpdated: '2018-12-10T23:17:22.448Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa39', id: '5c0ef40213bed00009ebaa39', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa39' } }
        }, {
          name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">{{.}}</div>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.180Z', lastUpdated: '2018-12-10T23:17:22.186Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa31', id: '5c0ef40213bed00009ebaa31', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa31' } }
        }, {
          name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.202Z', lastUpdated: '2018-12-10T23:17:22.204Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa33', id: '5c0ef40213bed00009ebaa33', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa33' } }
        }, {
          name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login">Log In</a></li>\n  {{/if}}\n</ul>', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-10T23:17:22.220Z', lastUpdated: '2018-12-10T23:17:22.223Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0ef40213bed00009ebaa35', id: '5c0ef40213bed00009ebaa35', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0ef40213bed00009ebaa35' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 6,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:23 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '13475',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .patch('/applications/5b9297591fefb200072e554d/experience/bootstrap', {})
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, { resourceSuffix: 'aSuffix', password: 'yp926mfr6a', email: 'test.user.yp926mfr6a@example.com' }, [ 'Date',
        'Mon, 10 Dec 2018 23:17:22 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '88',
        'Connection',
        'close',
        'Pragma',
        'no-cache',
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options',
        'nosniff',
        'X-XSS-Protection',
        '1; mode=block',
        'Content-Security-Policy',
        'default-src \'none\'; style-src \'unsafe-inline\'',
        'Access-Control-Allow-Origin',
        '*',
        'Strict-Transport-Security',
        'max-age=31536000' ]);

    const messages = [];
    sinon.stub(ssLog, 'stdout').callsFake((msg) => {
      messages.push(msg);
    });
    sinon.stub(inquirer, 'prompt').callsFake(() => {
      return Promise.resolve({ shouldBootstrap: true });
    });
    await buildConfig();
    await bootstrap();
    messages.should.deepEqual([
      processingLog('experience/layouts/Example Layout.hbs'),
      downloadLog('experience/layouts/Example Layout.hbs'),
      processingLog('experience/pages/Home Page.hbs'),
      downloadLog('experience/pages/Home Page.hbs'),
      processingLog('experience/pages/Log In.hbs'),
      downloadLog('experience/pages/Log In.hbs'),
      processingLog('experience/components/errorAlert.hbs'),
      downloadLog('experience/components/errorAlert.hbs'),
      processingLog('experience/components/gaTracking.hbs'),
      downloadLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/userIndicator.hbs'),
      downloadLog('experience/components/userIndicator.hbs'),
      `${pad(c.gray('Experience URL'), 13)}\thttps://aSlug.on.losant.com/aSuffix`,
      `${pad(c.gray('Bootstrap Username'), 13)}\ttest.user.yp926mfr6a@example.com`,
      `${pad(c.gray('Bootstrap Password'), 13)}\typ926mfr6a`,
      `${pad(c.green('Completed'), 13)}\tBootstrapping has been successful.`
    ]);
  });
});
