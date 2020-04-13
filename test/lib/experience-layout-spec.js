const experienceLayout = require('../../lib/experience-layout');
const { nock, sinon, buildConfig, printTable } = require('../common');
const ssLog = require('single-line-log');
const inquirer = require('inquirer');
const c = require('chalk');

describe('#ExperienceLayout', () => {
  it('should log out that not pages were found', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'page'
      })
      .reply(200, { count: 0, items: [] }, [ 'Date',
        'Fri, 07 Dec 2018 16:06:38 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '5924',
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
    await buildConfig();
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    await experienceLayout(undefined, {});
    message.should.equal('No pages were found for this application.');
  });
  it('it should print the table of all pages to layouts', async () => {

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'page'
      })
      .reply(200, {
        count: 2,
        items: [{
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5b92975dc2f8de0006e2ca93', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-09-07T20:31:57.217Z', viewTags: {}, experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
        }, {
          name: '/GET /Log In', description: 'Users who are not signed in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '5c0a9a163fb78400095ec089', body: '{{#fillSection "metaDescription"}}This is an example login page for your application experience.{{/fillSection}}\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="https://app.losant.com/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example <a target="_blank" href="https://docs.losant.com/experiences/views/#layouts">Layout</a>, <a target="_blank" href="https://docs.losant.com/experiences/views/#pages">Pages</a>, and <a target="_blank" href="https://docs.losant.com/experiences/views/#components">Components</a>\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email">Email address</label>\n          <input autofocus required value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input required minlength="8" maxlength="255" type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.345Z', lastUpdated: '2018-12-07T16:04:49.273Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975dc2f8de0006e2ca94', id: '5b92975dc2f8de0006e2ca94', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca94' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        viewType: 'page',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 2,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:06:38 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '5924',
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

    await buildConfig();
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    await experienceLayout(undefined, {});
    message.should.equal(printTable([ 'Page Name', 'Layout Name' ], [['Home Page', 'Example Layout'], ['/GET /Log In', 'Another Layout']]));
  });

  it('it should update a one page\'s layout', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'layout'
      })
      .reply(200, {
        count: 2,
        items: [{
          name: 'Another Layout', viewType: 'layout', body: '{{page}}', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-07T16:04:38.069Z', lastUpdated: '2018-12-07T16:04:38.072Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0a9a163fb78400095ec089', id: '5c0a9a163fb78400095ec089', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0a9a163fb78400095ec089' } }
        }, {
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: "<!doctype html>\n<!--[if lt IE 7]>      <html class=\"lt-ie9 lt-ie8 lt-ie7\" lang=\"\"> <![endif]-->\n<!--[if IE 7]>         <html class=\"lt-ie9 lt-ie8\" lang=\"\"> <![endif]-->\n<!--[if IE 8]>         <html class=\"lt-ie9\" lang=\"\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=\"\"> <!--<![endif]-->\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name=\"description\" content=\"{{section 'metaDescription'}}\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n    <link rel=\"icon\" type=\"image/x-icon\" href=\"https://app.losant.com/images/embree/favicon.ico\" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class=\"navbar navbar-default\" role=\"navigation\" style=\"border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;\">\n      <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"/\" style=\"padding-top:0; padding-bottom:0;\">\n            <img alt=\"Logo\" style=\"margin-top:13px; height: 24px;\" src=\"https://app.losant.com/images/embree/embree_sm.png\">\n          </a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav navbar-left\">\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n          </ul>\n          {{component \"userIndicator\"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style=\"text-align:center\">&copy; 2018. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    {{component \"gaTracking\" \"UA-XXXXX-X\"}}\n  </body>\n</html>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.223Z', lastUpdated: '2018-09-07T15:21:01.234Z', viewTags: {}, experienceViewId: '5b92975dc2f8de0006e2ca93', id: '5b92975dc2f8de0006e2ca93', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        viewType: 'layout',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 2,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '4851',
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
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'page', filterField: 'name', filter: 'Home Page'
      })
      .reply(200, {
        count: 1,
        items: [{
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5b92975dc2f8de0006e2ca93', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-09-07T20:31:57.217Z', viewTags: {}, experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
        }]
      },
      [
        'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '5924',
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
        'max-age=31536000'
      ]
      );

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50', { layoutId: '5c0a9a163fb78400095ec089' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5c0a9a163fb78400095ec089', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-12-07T16:51:59.784Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:51:59 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '2796',
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

    await buildConfig();
    let message;
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      message = _message;
    });
    sinon.stub(inquirer, 'prompt').callsFake(() => {
      return Promise.resolve({ name: 'Another Layout https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/layouts/5c0a9a163fb78400095ec089' });
    });
    await experienceLayout('Home Page', {});
    message.should.equal(`${c.green('Complete')}\tHome Page is now using the layout "Another Layout".`);
  });
  it('should update multiple pages layouts', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'layout'
      })
      .reply(200, {
        count: 2,
        items: [{
          name: 'Another Layout', viewType: 'layout', body: '{{page}}', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-07T16:04:38.069Z', lastUpdated: '2018-12-07T16:04:38.072Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0a9a163fb78400095ec089', id: '5c0a9a163fb78400095ec089', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0a9a163fb78400095ec089' } }
        }, {
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: "<!doctype html>\n<!--[if lt IE 7]>      <html class=\"lt-ie9 lt-ie8 lt-ie7\" lang=\"\"> <![endif]-->\n<!--[if IE 7]>         <html class=\"lt-ie9 lt-ie8\" lang=\"\"> <![endif]-->\n<!--[if IE 8]>         <html class=\"lt-ie9\" lang=\"\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=\"\"> <!--<![endif]-->\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name=\"description\" content=\"{{section 'metaDescription'}}\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n    <link rel=\"icon\" type=\"image/x-icon\" href=\"https://app.losant.com/images/embree/favicon.ico\" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class=\"navbar navbar-default\" role=\"navigation\" style=\"border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;\">\n      <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"/\" style=\"padding-top:0; padding-bottom:0;\">\n            <img alt=\"Logo\" style=\"margin-top:13px; height: 24px;\" src=\"https://app.losant.com/images/embree/embree_sm.png\">\n          </a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav navbar-left\">\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n          </ul>\n          {{component \"userIndicator\"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style=\"text-align:center\">&copy; 2018. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    {{component \"gaTracking\" \"UA-XXXXX-X\"}}\n  </body>\n</html>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.223Z', lastUpdated: '2018-09-07T15:21:01.234Z', viewTags: {}, experienceViewId: '5b92975dc2f8de0006e2ca93', id: '5b92975dc2f8de0006e2ca93', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        viewType: 'layout',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 2,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '4851',
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
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'page', filterField: 'name', filter: '*'
      })
      .reply(200, {
        count: 2,
        items: [
          {
            name: 'Home Page',
            description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.',
            viewType: 'page',
            layoutId: '5b92975dc2f8de0006e2ca93',
            body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>",
            applicationId: '5b9297591fefb200072e554d',
            creationDate: '2018-09-07T15:21:01.465Z',
            lastUpdated: '2018-09-07T20:31:57.217Z',
            viewTags: {},
            experienceViewId: '5b92975d376bb800087d1f50',
            id: '5b92975d376bb800087d1f50',
            version: 'develop',
            layoutName: 'Example Layout',
            _type: 'experienceView',
            _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
          },
          {
            name: 'Log In',
            viewType: 'page',
            layoutId: '5b92975dc2f8de0006e2ca93',
            body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>",
            applicationId: '5b9297591fefb200072e554d',
            creationDate: '2018-09-07T15:21:01.465Z',
            lastUpdated: '2018-09-07T20:31:57.217Z',
            viewTags: {},
            experienceViewId: '5b92975d376bb800087d1f50',
            id: '5b92975dc2f8de0006e2ca94',
            version: 'develop',
            layoutName: 'Example Layout',
            _type: 'experienceView',
            _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
          }
        ]
      },
      [
        'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '5924',
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
        'max-age=31536000'
      ]
      );

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50', { layoutId: '5c0a9a163fb78400095ec089' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5c0a9a163fb78400095ec089', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-12-07T16:51:59.784Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:51:59 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '2796',
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
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca94', { layoutId: '5c0a9a163fb78400095ec089' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'Log In', layoutId: '5c0a9a163fb78400095ec089', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-12-07T16:51:59.784Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:51:59 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '2796',
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

    await buildConfig();
    const messages = [];
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      messages.push(_message);
    });
    sinon.stub(inquirer, 'prompt').callsFake((config) => {
      if (config[0].type === 'list') {
        return Promise.resolve({ name: 'Another Layout https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/layouts/5c0a9a163fb78400095ec089' });
      } else {
        return Promise.resolve({
          pageKey: [
            'Home Page https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/pages/5b92975d376bb800087d1f50',
            'Log In https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/pages/5b92975dc2f8de0006e2ca94'
          ]
        });
      }
    });
    await experienceLayout('*', {});
    messages.should.deepEqual([
      `${c.green('Complete')}\tHome Page is now using the layout "Another Layout".`,
      `${c.green('Complete')}\tLog In is now using the layout "Another Layout".`
    ]);
  });

  it('should update multiple pages layouts to null', async () => {
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'layout'
      })
      .reply(200, {
        count: 2,
        items: [{
          name: 'Another Layout', viewType: 'layout', body: '{{page}}', createdById: '59a41ff6b36c040007c6e2eb', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-12-07T16:04:38.069Z', lastUpdated: '2018-12-07T16:04:38.072Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5c0a9a163fb78400095ec089', id: '5c0a9a163fb78400095ec089', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5c0a9a163fb78400095ec089' } }
        }, {
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: "<!doctype html>\n<!--[if lt IE 7]>      <html class=\"lt-ie9 lt-ie8 lt-ie7\" lang=\"\"> <![endif]-->\n<!--[if IE 7]>         <html class=\"lt-ie9 lt-ie8\" lang=\"\"> <![endif]-->\n<!--[if IE 8]>         <html class=\"lt-ie9\" lang=\"\"> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=\"\"> <!--<![endif]-->\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name=\"description\" content=\"{{section 'metaDescription'}}\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n    <link rel=\"icon\" type=\"image/x-icon\" href=\"https://app.losant.com/images/embree/favicon.ico\" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class=\"browserupgrade\">You are using an <strong>outdated</strong> browser. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class=\"navbar navbar-default\" role=\"navigation\" style=\"border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;\">\n      <div class=\"container-fluid\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand\" href=\"/\" style=\"padding-top:0; padding-bottom:0;\">\n            <img alt=\"Logo\" style=\"margin-top:13px; height: 24px;\" src=\"https://app.losant.com/images/embree/embree_sm.png\">\n          </a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav navbar-left\">\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n            <li><a href=\"#\">Link</a></li>\n          </ul>\n          {{component \"userIndicator\"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style=\"text-align:center\">&copy; 2018. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src=\"https://code.jquery.com/jquery-3.2.1.slim.min.js\" integrity=\"sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js\" integrity=\"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa\" crossorigin=\"anonymous\"></script>\n    {{component \"gaTracking\" \"UA-XXXXX-X\"}}\n  </body>\n</html>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.223Z', lastUpdated: '2018-09-07T15:21:01.234Z', viewTags: {}, experienceViewId: '5b92975dc2f8de0006e2ca93', id: '5b92975dc2f8de0006e2ca93', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca93' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        viewType: 'layout',
        perPage: 1000,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 2,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '4851',
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
      .query({
        _actions: 'false', _links: 'true', _embedded: 'true', page: '0', perPage: '1000', viewType: 'page', filterField: 'name', filter: '*'
      })
      .reply(200, {
        count: 2,
        items: [
          {
            name: 'Home Page',
            description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.',
            viewType: 'page',
            layoutId: '5b92975dc2f8de0006e2ca93',
            body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>",
            applicationId: '5b9297591fefb200072e554d',
            creationDate: '2018-09-07T15:21:01.465Z',
            lastUpdated: '2018-09-07T20:31:57.217Z',
            viewTags: {},
            experienceViewId: '5b92975d376bb800087d1f50',
            id: '5b92975d376bb800087d1f50',
            version: 'develop',
            layoutName: 'Example Layout',
            _type: 'experienceView',
            _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
          },
          {
            name: 'Log In',
            viewType: 'page',
            layoutId: '5b92975dc2f8de0006e2ca93',
            body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>",
            applicationId: '5b9297591fefb200072e554d',
            creationDate: '2018-09-07T15:21:01.465Z',
            lastUpdated: '2018-09-07T20:31:57.217Z',
            viewTags: {},
            experienceViewId: '5b92975d376bb800087d1f50',
            id: '5b92975dc2f8de0006e2ca94',
            version: 'develop',
            layoutName: 'Example Layout',
            _type: 'experienceView',
            _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
          }
        ]
      },
      [
        'Date',
        'Fri, 07 Dec 2018 16:41:37 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '5924',
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
        'max-age=31536000'
      ]
      );

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50', { layoutId: null })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '5c0a9a163fb78400095ec089', body: "{{#fillSection \"metaDescription\"}}This is an example home page for your application experience.{{/fillSection}}\n<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example of a change and back down <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a target=\"_blank\" href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a target=\"_blank\" href=\"https://docs.losant.com/experiences/walkthrough/views/overview/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-12-07T16:51:59.784Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:51:59 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '2796',
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
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5b92975dc2f8de0006e2ca94', { layoutId: null })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'Log In', layoutId: '5c0a9a163fb78400095ec089', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-09-07T15:21:01.465Z', lastUpdated: '2018-12-07T16:51:59.784Z', viewTags: {}, lastUpdatedById: '59a41ff6b36c040007c6e2eb', lastUpdatedByType: 'user', experienceViewId: '5b92975d376bb800087d1f50', id: '5b92975d376bb800087d1f50', version: 'develop', layoutName: 'Another Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5b92975d376bb800087d1f50' } }
      }, [ 'Date',
        'Fri, 07 Dec 2018 16:51:59 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '2796',
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

    await buildConfig();
    const messages = [];
    sinon.stub(ssLog, 'stdout').callsFake((_message) => {
      messages.push(_message);
    });
    sinon.stub(inquirer, 'prompt').callsFake((config) => {
      if (config[0].type === 'list') {
        return Promise.resolve({ name: 'no layout' });
      } else {
        return Promise.resolve({
          pageKey: [
            'Home Page https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/pages/5b92975d376bb800087d1f50',
            'Log In https://app.losant.com/applications/5b9297591fefb200072e554d/experience/versions/develop/views/pages/5b92975dc2f8de0006e2ca94'
          ]
        });
      }
    });
    await experienceLayout('*', {});
    messages.should.deepEqual([
      `${c.green('Complete')}\tHome Page no longer has a layout set.`,
      `${c.green('Complete')}\tLog In no longer has a layout set.`
    ]);
  });
});
