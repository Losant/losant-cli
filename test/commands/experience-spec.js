const path = require('path');
const ssLog = require('single-line-log');
const {
  sinon,
  nock,
  downloadLog,
  conflictLog,
  errorLog,
  unlockConfigFiles,
  buildConfig,
  buildUserConfig,
  printTable,
  processingLog,
  unmodifiedLog,
  deletedUploadLog,
  uploadedLog,
  statusExpHeaders
} = require('../common');
const { defer } = require('omnibelt');
let spy;
const { remove, writeFile, ensureFile } = require('fs-extra');
const c = require('chalk');
const CONFIG_FILE = '.application.yml';

describe('Experience Commands', () => {
  it('should log an error if configure was not run first', async () => {
    await buildUserConfig();
    const deferred = defer();
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {

      deferred.resolve(message);
    });
    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal(errorLog('Configuration file missing for this directory, run losant configure to generate this file.'));
  });
  it('should run get status', async () => {
    await buildConfig();
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: 10,
        items: [{
          name: 'Dashboard Stream Only', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "56e1f44adf5a100100d943bc") ctx=(obj string-0=(template "{{pageData.deviceId}}") string-1=(template "def")) theme=(template "dark") time=(template "1516044628000") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-15T16:14:32.516Z', lastUpdated: '2018-10-15T17:08:04.289Z', viewTags: {}, description: '', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a33f4e847308400073d07f4', id: '5a33f4e847308400073d07f4', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a33f4e847308400073d07f4' } }
        }, {
          name: 'Dashboard Transferred', viewType: 'page', body: "{{ element \"dashboard\" dashboardId=(template \"{{'5a37d72d47308400073d07f6'}}\") ctx=(obj deviceId-0=(template \"59021caf9e2a180001268984\")) theme=(template \"light\") time=(template \"\") }}", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-18T16:16:34.640Z', lastUpdated: '2018-10-15T17:07:28.168Z', viewTags: {}, description: 's', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a37e9e247308400073d07fb', id: '5a37e9e247308400073d07fb', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a37e9e247308400073d07fb' } }
        }, {
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: '<!doctype html>\n<!--[if lt IE 7]>      <html class="lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->\n<!--[if IE 7]>         <html class="lt-ie9 lt-ie8" lang=""> <![endif]-->\n<!--[if IE 8]>         <html class="lt-ie9" lang=""> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=""> <!--<![endif]-->\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name="description" content="">\n    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n    <link rel="icon" type="image/x-icon" href="http://localapp.losant.com:8080/images/embree/favicon.ico" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class="navbar navbar-default" role="navigation" style="border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;">\n      <div class="container-fluid">\n        <div class="navbar-header">\n          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\n            <span class="sr-only">Toggle navigation</span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n          </button>\n          <a class="navbar-brand" href="/home-H1gSgMYkCZ" style="padding-top:0; padding-bottom:0;">\n            <img alt="Logo" style="margin-top:13px; height: 24px;" src="http://localapp.losant.com:8080/images/embree/embree_sm.png">\n          </a>\n        </div>\n        <div id="navbar" class="navbar-collapse collapse">\n          <ul class="nav navbar-nav navbar-left">\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n          </ul>\n          {{component "userIndicator"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style="text-align:center">&copy; 2017. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>\n    {{component "gaTracking" "UA-XXXXX-X"}}\n  </body>\n</html>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.160Z', lastUpdated: '2018-10-12T23:01:04.713Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '59f201ed95c9e70007b7ffc3', id: '59f201ed95c9e70007b7ffc3', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc3' } }
        }, {
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: "<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a href=\"https://docs.losant.com/experiences/view-walkthrough/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.586Z', lastUpdated: '2018-09-18T21:45:59.899Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc5', id: '59f201ed95c9e70007b7ffc5', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc5' } }
        }, {
          name: 'Log In', description: 'Users who are not signed in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login-H1gSgMYkCZ endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{#fillSection "foo"}}sdsds{{/fillSection}}\n\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="http://localapp.losant.com:8080/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example Layout, Pages, and Components\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email" id="email">Email address</label>\n          <input autofocus value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.322Z', lastUpdated: '2018-09-18T21:45:59.888Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a94', id: '59f201edf21ee00007a93a94', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a94' } }
        }, {
          name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "58ebd885e326860001a6699f") ctx=(obj devId=(template "{{request.query.deviceId}}")) theme=(template "light") time=(template "") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
        }, {
          name: 'default auto set', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'sd', createdById: '56c7420e63b022010029fcd3', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-10-09T00:23:55.322Z', lastUpdated: '2018-10-09T00:23:55.327Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5bbbf51b1785cf0006a9e8ec', id: '5bbbf51b1785cf0006a9e8ec', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5bbbf51b1785cf0006a9e8ec' } }
        }, {
          name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">\n  {{.}}\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.781Z', lastUpdated: '2018-09-18T21:45:59.909Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a96', id: '59f201edf21ee00007a93a96', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a96' } }
        }, {
          name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.963Z', lastUpdated: '2018-09-18T21:45:59.919Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc7', id: '59f201ed95c9e70007b7ffc7', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc7' } }
        }, {
          name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout-H1gSgMYkCZ">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login-H1gSgMYkCZ">Log In</a></li>\n  {{/if}}\n</ul>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:30.111Z', lastUpdated: '2018-09-18T21:45:59.929Z', viewTags: {}, experienceViewId: '59f201eef21ee00007a93a98', id: '59f201eef21ee00007a93a98', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201eef21ee00007a93a98' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        perPage: 100,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 10,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Thu, 18 Oct 2018 19:37:34 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '15063',
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
    const deferred = defer();
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      deferred.resolve(message);
    });

    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    const msg = await deferred.promise;
    msg.should.equal(printTable(
      statusExpHeaders,
      [
        ['errorAlert', 'component', c.blue('missing'), c.green('added'), c.gray('no')],
        ['gaTracking', 'component', c.blue('missing'), c.green('added'), c.gray('no')],
        ['userIndicator', 'component', c.blue('missing'), c.green('added'), c.gray('no')],
        ['Example Layout', 'layout', c.blue('missing'), c.green('added'), c.gray('no')],
        ['Dashboard Stream Only', 'page', c.blue('missing'), c.green('added'), c.gray('no')],
        ['Dashboard Transferred', 'page', c.blue('missing'), c.green('added'), c.gray('no')],
        ['Home Page', 'page', c.blue('missing'), c.green('added'), c.gray('no')],
        ['Log In', 'page', c.blue('missing'), c.green('added'), c.gray('no')],
        ['dash', 'page', c.blue('missing'), c.green('added'), c.gray('no')],
        ['default auto set', 'page', c.blue('missing'), c.green('added'), c.gray('no')]
      ]
    ));
  });
  it('should run get status, download, and not upload because of conflicts', async function() {
    await buildConfig();
    for (let i = 0; i < 3; i++) {
      nock('https://api.losant.com:443', { encodedQueryParams: true })
        .get('/applications/5b9297591fefb200072e554d/experience/views')
        .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
        .reply(200, {
          count: 10,
          items: [{
            name: 'Dashboard Stream Only', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "56e1f44adf5a100100d943bc") ctx=(obj string-0=(template "{{pageData.deviceId}}") string-1=(template "def")) theme=(template "dark") time=(template "1516044628000") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-15T16:14:32.516Z', lastUpdated: '2018-10-15T17:08:04.289Z', viewTags: {}, description: '', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a33f4e847308400073d07f4', id: '5a33f4e847308400073d07f4', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a33f4e847308400073d07f4' } }
          }, {
            name: 'Dashboard Transferred', viewType: 'page', body: "{{ element \"dashboard\" dashboardId=(template \"{{'5a37d72d47308400073d07f6'}}\") ctx=(obj deviceId-0=(template \"59021caf9e2a180001268984\")) theme=(template \"light\") time=(template \"\") }}", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-18T16:16:34.640Z', lastUpdated: '2018-10-15T17:07:28.168Z', viewTags: {}, description: 's', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a37e9e247308400073d07fb', id: '5a37e9e247308400073d07fb', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a37e9e247308400073d07fb' } }
          }, {
            name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: '<!doctype html>\n<!--[if lt IE 7]>      <html class="lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->\n<!--[if IE 7]>         <html class="lt-ie9 lt-ie8" lang=""> <![endif]-->\n<!--[if IE 8]>         <html class="lt-ie9" lang=""> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=""> <!--<![endif]-->\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name="description" content="">\n    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n    <link rel="icon" type="image/x-icon" href="http://localapp.losant.com:8080/images/embree/favicon.ico" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class="navbar navbar-default" role="navigation" style="border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;">\n      <div class="container-fluid">\n        <div class="navbar-header">\n          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\n            <span class="sr-only">Toggle navigation</span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n          </button>\n          <a class="navbar-brand" href="/home-H1gSgMYkCZ" style="padding-top:0; padding-bottom:0;">\n            <img alt="Logo" style="margin-top:13px; height: 24px;" src="http://localapp.losant.com:8080/images/embree/embree_sm.png">\n          </a>\n        </div>\n        <div id="navbar" class="navbar-collapse collapse">\n          <ul class="nav navbar-nav navbar-left">\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n          </ul>\n          {{component "userIndicator"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style="text-align:center">&copy; 2017. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>\n    {{component "gaTracking" "UA-XXXXX-X"}}\n  </body>\n</html>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.160Z', lastUpdated: '2018-10-12T23:01:04.713Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '59f201ed95c9e70007b7ffc3', id: '59f201ed95c9e70007b7ffc3', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc3' } }
          }, {
            name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: "<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a href=\"https://docs.losant.com/experiences/view-walkthrough/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.586Z', lastUpdated: '2018-09-18T21:45:59.899Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc5', id: '59f201ed95c9e70007b7ffc5', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc5' } }
          }, {
            name: 'Log In', description: 'Users who are not signed in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login-H1gSgMYkCZ endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{#fillSection "foo"}}sdsds{{/fillSection}}\n\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="http://localapp.losant.com:8080/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example Layout, Pages, and Components\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email" id="email">Email address</label>\n          <input autofocus value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.322Z', lastUpdated: '2018-09-18T21:45:59.888Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a94', id: '59f201edf21ee00007a93a94', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a94' } }
          }, {
            name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "58ebd885e326860001a6699f") ctx=(obj devId=(template "{{request.query.deviceId}}")) theme=(template "light") time=(template "") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
          }, {
            name: 'default auto set', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'sd', createdById: '56c7420e63b022010029fcd3', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-10-09T00:23:55.322Z', lastUpdated: '2018-10-09T00:23:55.327Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5bbbf51b1785cf0006a9e8ec', id: '5bbbf51b1785cf0006a9e8ec', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5bbbf51b1785cf0006a9e8ec' } }
          }, {
            name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">\n  {{.}}\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.781Z', lastUpdated: '2018-09-18T21:45:59.909Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a96', id: '59f201edf21ee00007a93a96', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a96' } }
          }, {
            name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.963Z', lastUpdated: '2018-09-18T21:45:59.919Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc7', id: '59f201ed95c9e70007b7ffc7', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc7' } }
          }, {
            name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout-H1gSgMYkCZ">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login-H1gSgMYkCZ">Log In</a></li>\n  {{/if}}\n</ul>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:30.111Z', lastUpdated: '2018-09-18T21:45:59.929Z', viewTags: {}, experienceViewId: '59f201eef21ee00007a93a98', id: '59f201eef21ee00007a93a98', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201eef21ee00007a93a98' } }
          }],
          applicationId: '5b9297591fefb200072e554d',
          version: 'develop',
          perPage: 100,
          page: 0,
          sortField: 'name',
          sortDirection: 'asc',
          totalCount: 10,
          _type: 'experienceViews',
          _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
        }, [ 'Date',
          'Thu, 18 Oct 2018 19:37:34 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '15063',
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
    }

    await unlockConfigFiles(CONFIG_FILE);
    const deferred = defer();
    const messages = [];
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      messages.push(message);
      if (messages.length === 20) {
        deferred.resolve(messages);
      }
    });

    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'download'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    const msgs = await deferred.promise;
    msgs.length.should.equal(20);
    msgs.sort().should.deepEqual([
      downloadLog('experience/components/errorAlert.hbs'),
      downloadLog('experience/components/gaTracking.hbs'),
      downloadLog('experience/components/userIndicator.hbs'),
      downloadLog('experience/layouts/Example Layout.hbs'),
      downloadLog('experience/pages/Dashboard Stream Only.hbs'),
      downloadLog('experience/pages/Dashboard Transferred.hbs'),
      downloadLog('experience/pages/Home Page.hbs'),
      downloadLog('experience/pages/Log In.hbs'),
      downloadLog('experience/pages/dash.hbs'),
      downloadLog('experience/pages/default auto set.hbs'),
      processingLog('experience/components/errorAlert.hbs'),
      processingLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/userIndicator.hbs'),
      processingLog('experience/layouts/Example Layout.hbs'),
      processingLog('experience/pages/Dashboard Stream Only.hbs'),
      processingLog('experience/pages/Dashboard Transferred.hbs'),
      processingLog('experience/pages/Home Page.hbs'),
      processingLog('experience/pages/Log In.hbs'),
      processingLog('experience/pages/dash.hbs'),
      processingLog('experience/pages/default auto set.hbs')
    ]);
    await spy.restore();
    let statusDeferred = defer();
    let statusMessage = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDeferred.resolve();
    });
    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await statusDeferred.promise;
    statusMessage.should.equal(printTable(statusExpHeaders,
      [
        ['errorAlert', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['gaTracking', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['userIndicator', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Example Layout', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Stream Only', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Transferred', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Home Page', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Log In', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['dash', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['default auto set', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')]
      ]));
    await spy.restore();

    await remove('./experience/components/errorAlert.hbs');
    await remove('./experience/components/gaTracking.hbs');
    await writeFile('./experience/pages/dash.hbs', 'hello world...');
    await writeFile('experience/pages/Dashboard Stream Only.hbs', 'Oh hi mark...');
    await ensureFile('./experience/pages/newPage.hbs');
    await writeFile('./experience/pages/newPage.hbs', 'a whole new page!');
    statusDeferred = defer();
    statusMessage = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDeferred.resolve();
    });
    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await statusDeferred.promise;
    statusMessage.should.equal(printTable(statusExpHeaders,
      [
        ['errorAlert', 'component', c.red('deleted'), c.gray('unmodified'), c.gray('no')],
        ['gaTracking', 'component', c.red('deleted'), c.gray('unmodified'), c.gray('no')],
        ['userIndicator', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Example Layout', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Stream Only', 'page', c.yellow('modified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Transferred', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Home Page', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Log In', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['dash', 'page', c.yellow('modified'), c.gray('unmodified'), c.gray('no')],
        ['default auto set', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['newPage', 'page', c.green('added'), c.blue('missing'), c.gray('no')]
      ]));
    spy.restore();
    const uploadDeferred = defer();
    const uploadMessages = [];
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      uploadMessages.push(message);
      uploadDeferred.resolve();
    });

    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .get('/applications/5b9297591fefb200072e554d/experience/views')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
      .reply(200, {
        count: 10,
        items: [{
          name: 'Dashboard Stream Only', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-15T16:14:32.516Z', lastUpdated: '2018-10-19T17:08:04.289Z', viewTags: {}, description: '', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a33f4e847308400073d07f4', id: '5a33f4e847308400073d07f4', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a33f4e847308400073d07f4' } }
        }, {
          name: 'Dashboard Transferred', viewType: 'page', body: "{{ element \"dashboard\" dashboardId=(template \"{{'5a37d72d47308400073d07f6'}}\") ctx=(obj deviceId-0=(template \"59021caf9e2a180001268984\")) theme=(template \"light\") time=(template \"\") }}", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-18T16:16:34.640Z', lastUpdated: '2018-10-15T17:07:28.168Z', viewTags: {}, description: 's', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a37e9e247308400073d07fb', id: '5a37e9e247308400073d07fb', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a37e9e247308400073d07fb' } }
        }, {
          name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: '<!doctype html>\n<!--[if lt IE 7]>      <html class="lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->\n<!--[if IE 7]>         <html class="lt-ie9 lt-ie8" lang=""> <![endif]-->\n<!--[if IE 8]>         <html class="lt-ie9" lang=""> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=""> <!--<![endif]-->\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name="description" content="">\n    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n    <link rel="icon" type="image/x-icon" href="http://localapp.losant.com:8080/images/embree/favicon.ico" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class="navbar navbar-default" role="navigation" style="border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;">\n      <div class="container-fluid">\n        <div class="navbar-header">\n          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\n            <span class="sr-only">Toggle navigation</span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n          </button>\n          <a class="navbar-brand" href="/home-H1gSgMYkCZ" style="padding-top:0; padding-bottom:0;">\n            <img alt="Logo" style="margin-top:13px; height: 24px;" src="http://localapp.losant.com:8080/images/embree/embree_sm.png">\n          </a>\n        </div>\n        <div id="navbar" class="navbar-collapse collapse">\n          <ul class="nav navbar-nav navbar-left">\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n          </ul>\n          {{component "userIndicator"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style="text-align:center">&copy; 2017. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>\n    {{component "gaTracking" "UA-XXXXX-X"}}\n  </body>\n</html>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.160Z', lastUpdated: '2018-10-12T23:01:04.713Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '59f201ed95c9e70007b7ffc3', id: '59f201ed95c9e70007b7ffc3', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc3' } }
        }, {
          name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: "<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a href=\"https://docs.losant.com/experiences/view-walkthrough/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.586Z', lastUpdated: '2018-09-18T21:45:59.899Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc5', id: '59f201ed95c9e70007b7ffc5', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc5' } }
        }, {
          name: 'Log In', description: 'Users who are not signed in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login-H1gSgMYkCZ endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{#fillSection "foo"}}sdsds{{/fillSection}}\n\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="http://localapp.losant.com:8080/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example Layout, Pages, and Components\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email" id="email">Email address</label>\n          <input autofocus value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.322Z', lastUpdated: '2018-09-18T21:45:59.888Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a94', id: '59f201edf21ee00007a93a94', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a94' } }
        }, {
          name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "58ebd885e326860001a6699f") ctx=(obj devId=(template "{{request.query.deviceId}}")) theme=(template "light") time=(template "") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
        }, {
          name: 'default auto set', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'sd', createdById: '56c7420e63b022010029fcd3', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-10-09T00:23:55.322Z', lastUpdated: '2018-10-09T00:23:55.327Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5bbbf51b1785cf0006a9e8ec', id: '5bbbf51b1785cf0006a9e8ec', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5bbbf51b1785cf0006a9e8ec' } }
        }, {
          name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">\n  {{.}}\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.781Z', lastUpdated: '2018-09-18T21:45:59.909Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a96', id: '59f201edf21ee00007a93a96', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a96' } }
        }, {
          name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.963Z', lastUpdated: '2018-09-18T21:45:59.919Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc7', id: '59f201ed95c9e70007b7ffc7', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc7' } }
        }, {
          name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout-H1gSgMYkCZ">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login-H1gSgMYkCZ">Log In</a></li>\n  {{/if}}\n</ul>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:30.111Z', lastUpdated: '2018-09-18T21:45:59.929Z', viewTags: {}, experienceViewId: '59f201eef21ee00007a93a98', id: '59f201eef21ee00007a93a98', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201eef21ee00007a93a98' } }
        }],
        applicationId: '5b9297591fefb200072e554d',
        version: 'develop',
        perPage: 100,
        page: 0,
        sortField: 'name',
        sortDirection: 'asc',
        totalCount: 10,
        _type: 'experienceViews',
        _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
      }, [ 'Date',
        'Thu, 18 Oct 2018 19:37:34 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '15063',
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

    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'upload'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await uploadDeferred.promise;
    uploadMessages.sort().should.deepEqual([
      conflictLog('You are in a state of conflict cannot upload until resolved.')
    ]);
  });


  it('should run get status, download, and upload', async function() {
    await buildConfig();
    for (let i = 0; i < 4; i++) {
      nock('https://api.losant.com:443', { encodedQueryParams: true })
        .get('/applications/5b9297591fefb200072e554d/experience/views')
        .query({ _actions: 'false', _links: 'true', _embedded: 'true', page: 0, perPage: 1000 })
        .reply(200, {
          count: 10,
          items: [{
            name: 'Dashboard Stream Only', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "56e1f44adf5a100100d943bc") ctx=(obj string-0=(template "{{pageData.deviceId}}") string-1=(template "def")) theme=(template "dark") time=(template "1516044628000") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-15T16:14:32.516Z', lastUpdated: '2018-10-15T17:08:04.289Z', viewTags: {}, description: '', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a33f4e847308400073d07f4', id: '5a33f4e847308400073d07f4', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a33f4e847308400073d07f4' } }
          }, {
            name: 'Dashboard Transferred', viewType: 'page', body: "{{ element \"dashboard\" dashboardId=(template \"{{'5a37d72d47308400073d07f6'}}\") ctx=(obj deviceId-0=(template \"59021caf9e2a180001268984\")) theme=(template \"light\") time=(template \"\") }}", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-12-18T16:16:34.640Z', lastUpdated: '2018-10-15T17:07:28.168Z', viewTags: {}, description: 's', lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5a37e9e247308400073d07fb', id: '5a37e9e247308400073d07fb', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5a37e9e247308400073d07fb' } }
          }, {
            name: 'Example Layout', description: 'Example layout using Twitter Bootstrap v3 scripts, stylesheets and scaffolding. You may create any number of layouts and reference them when rendering your pages, and you can include any common CSS or JavaScript in the layout.', viewType: 'layout', body: '<!doctype html>\n<!--[if lt IE 7]>      <html class="lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->\n<!--[if IE 7]>         <html class="lt-ie9 lt-ie8" lang=""> <![endif]-->\n<!--[if IE 8]>         <html class="lt-ie9" lang=""> <![endif]-->\n<!--[if gt IE 8]><!--> <html lang=""> <!--<![endif]-->\n  <head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n    <title>{{ experience.page.name }} | My Experience</title>\n    <meta name="description" content="">\n    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\n    <link rel="icon" type="image/x-icon" href="http://localapp.losant.com:8080/images/embree/favicon.ico" />\n    <!-- Latest compiled and minified CSS -->\n    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">\n  </head>\n  <body>\n    <!--[if lt IE 8]>\n      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>\n    <![endif]-->\n    <nav class="navbar navbar-default" role="navigation" style="border-width: 0 0 1px; border-radius: 0; -webkit-border-radius:0;">\n      <div class="container-fluid">\n        <div class="navbar-header">\n          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">\n            <span class="sr-only">Toggle navigation</span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n            <span class="icon-bar"></span>\n          </button>\n          <a class="navbar-brand" href="/home-H1gSgMYkCZ" style="padding-top:0; padding-bottom:0;">\n            <img alt="Logo" style="margin-top:13px; height: 24px;" src="http://localapp.losant.com:8080/images/embree/embree_sm.png">\n          </a>\n        </div>\n        <div id="navbar" class="navbar-collapse collapse">\n          <ul class="nav navbar-nav navbar-left">\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n            <li><a href="#">Link</a></li>\n          </ul>\n          {{component "userIndicator"}}\n        </div>\n      </div>\n    </nav>\n    {{ page }}\n    <hr>\n    <footer>\n      <p style="text-align:center">&copy; 2017. All rights reserved.</p>\n    </footer>\n    <!-- Bootstrap core JavaScript\n    ================================================== -->\n    <!-- Placed at the end of the document so the pages load faster -->\n    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>\n    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>\n    {{component "gaTracking" "UA-XXXXX-X"}}\n  </body>\n</html>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.160Z', lastUpdated: '2018-10-12T23:01:04.713Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '59f201ed95c9e70007b7ffc3', id: '59f201ed95c9e70007b7ffc3', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc3' } }
          }, {
            name: 'Home Page', description: 'Here is an example home page, which renders only for logged-in users. Within the workflow that renders this template, we redirect to the Login page if the experience user is not signed in. This page renders within your Example Layout at the position of the {{ page }} tag.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: "<div class=\"container\">\n  <div class=\"jumbotron\">\n    <h1>Your Experience View!</h1>\n    <p class=\"lead\">\n      This is an example <a href=\"https://docs.losant.com/experiences/views/\">Experience View</a> we've built for you. It provides many of the common\n      components that most web pages have, like a header, footer, and navigation. You can use this\n      as a launching point for your own custom user interfaces.\n    </p>\n  </div>\n  <p>\n    All Experiences Views start with a <a href=\"https://docs.losant.com/experiences/views/#layouts\">Layout</a>. The layout includes common items found on\n    all pages, like a header and footer. <a href=\"https://docs.losant.com/experiences/views/#pages\">Pages</a> are then rendered inside\n    the layout.\n  </p>\n  <p>There are two types of pages available: <a href=\"https://docs.losant.com/experiences/views/#custom-pages\">Custom</a> and <a href=\"https://docs.losant.com/experiences/views/#dashboard-pages\">Dashboard</a>.\n    What you're reading now is an example of a custom page. Dashboard pages allow you to embed an\n    existing dashboard, which is a fast way to publish data to your Experience Users.\n  </p>\n  <p>\n    For additional information, please read the <a href=\"https://docs.losant.com/experiences/view-walkthrough/\">Experience View Walkthrough</a>, which includes\n    detailed instructions for how to build a complete example that includes both custom and\n    dashboard pages.\n  </p>\n  <p>\n    This example is created using <a href=\"https://getbootstrap.com/docs/3.3/\" target=\"_blank\">Twitter Bootstrap</a>, which\n    provides many components, styles, and utilities that make building web pages simple.\n  </p>\n</div>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.586Z', lastUpdated: '2018-09-18T21:45:59.899Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc5', id: '59f201ed95c9e70007b7ffc5', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc5' } }
          }, {
            name: 'Log In', description: 'Users who are not signed in will be redirected to this page when they try to visit the home page. This is a simple login form; when the user submits the form, it will hit the POST /login-H1gSgMYkCZ endpoint with the email and password submitted by the user. If the credentials are valid, the user will get an authentication cookie and will be redirected to the Home page.', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{#fillSection "foo"}}sdsds{{/fillSection}}\n\n<div class="container-fluid">\n  <div class="row">\n    <div class="col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">\n      <div style="max-width: 300px; margin: 0 auto 20px; text-align: center;">\n        <img class="img-responsive" src="http://localapp.losant.com:8080/images/embree/embree_full.png" alt="Big Logo">\n      </div>\n      <div class="well">\n        <p>\n          Welcome to your example Experience View! The above logos and this content\n          can be customized by editing the example Layout, Pages, and Components\n          that were automatically generated for you.\n        </p>\n        <p>\n          Log in below with your example user to see the next page with\n          additional information.\n        </p>\n      </div>\n      {{#if pageData.loginFailure}}\n        {{component "errorAlert" "Incorrect email or password."}}\n      {{/if}}\n      <form method="post">\n        <div class="form-group">\n          <label for="email" id="email">Email address</label>\n          <input autofocus value="{{ pageData.email }}" type="email" class="form-control" name="email" id="email" placeholder="e.g. test.user@example.com">\n        </div>\n        <div class="form-group">\n          <label for="password">Password</label>\n          <input type="password" class="form-control" id="password" name="password">\n        </div>\n        <button type="submit" class="btn btn-success">Sign In</button>\n      </form>\n    </div>\n  </div>\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.322Z', lastUpdated: '2018-09-18T21:45:59.888Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a94', id: '59f201edf21ee00007a93a94', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a94' } }
          }, {
            name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: '{{ element "dashboard" dashboardId=(template "58ebd885e326860001a6699f") ctx=(obj devId=(template "{{request.query.deviceId}}")) theme=(template "light") time=(template "") }}', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
          }, {
            name: 'default auto set', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'sd', createdById: '56c7420e63b022010029fcd3', createdByType: 'user', applicationId: '5b9297591fefb200072e554d', creationDate: '2018-10-09T00:23:55.322Z', lastUpdated: '2018-10-09T00:23:55.327Z', viewTags: {}, lastUpdatedById: '56c7420e63b022010029fcd3', lastUpdatedByType: 'user', experienceViewId: '5bbbf51b1785cf0006a9e8ec', id: '5bbbf51b1785cf0006a9e8ec', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/5bbbf51b1785cf0006a9e8ec' } }
          }, {
            name: 'errorAlert', description: 'A simple helper component for rendering an "error bar". In the example login page, this is used to alert the user that their credentials are invalid when they attempt to log in and the request fails.', viewType: 'component', body: '<div class="alert alert-danger">\n  {{.}}\n</div>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.781Z', lastUpdated: '2018-09-18T21:45:59.909Z', viewTags: {}, experienceViewId: '59f201edf21ee00007a93a96', id: '59f201edf21ee00007a93a96', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a96' } }
          }, {
            name: 'gaTracking', description: 'An example tracking script block which is referenced in the Example Layout. If you wish to enable Google Analytics, set your ID where the component is placed within the layout.', viewType: 'component', body: "<script>\n  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=\n  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;\n  e=o.createElement(i);r=o.getElementsByTagName(i)[0];\n  e.src='//www.google-analytics.com/analytics.js';\n  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));\n  ga('create','{{.}}','auto');ga('send','pageview');\n</script>", applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:29.963Z', lastUpdated: '2018-09-18T21:45:59.919Z', viewTags: {}, experienceViewId: '59f201ed95c9e70007b7ffc7', id: '59f201ed95c9e70007b7ffc7', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc7' } }
          }, {
            name: 'userIndicator', description: 'An indicator for whether the user is logged in; this resides in the top right corner of the layout. When logged in, this becomes a dropdown with a "Log Out" option. When not logged in, this is a link to the Log In page.', viewType: 'component', body: '<ul class="nav navbar-nav navbar-right">\n  {{#if experience.user}}\n    <li class="dropdown">\n      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{experience.user.firstName}} <span class="caret"></span></a>\n      <ul class="dropdown-menu">\n        <li><a href="/logout-H1gSgMYkCZ">Log Out</a></li>\n      </ul>\n    </li>\n  {{else}}\n    <li><a href="/login-H1gSgMYkCZ">Log In</a></li>\n  {{/if}}\n</ul>', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T15:40:30.111Z', lastUpdated: '2018-09-18T21:45:59.929Z', viewTags: {}, experienceViewId: '59f201eef21ee00007a93a98', id: '59f201eef21ee00007a93a98', version: 'develop', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f201eef21ee00007a93a98' } }
          }],
          applicationId: '5b9297591fefb200072e554d',
          version: 'develop',
          perPage: 100,
          page: 0,
          sortField: 'name',
          sortDirection: 'asc',
          totalCount: 10,
          _type: 'experienceViews',
          _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views' } }
        }, [ 'Date',
          'Thu, 18 Oct 2018 19:37:34 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '15063',
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
    }

    await unlockConfigFiles(CONFIG_FILE);
    const deferred = defer();
    const messages = [];
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      messages.push(message);
      if (messages.length === 20) {
        deferred.resolve(messages);
      }
    });

    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'download'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    const msgs = await deferred.promise;
    msgs.length.should.equal(20);
    msgs.sort().should.deepEqual([
      downloadLog('experience/components/errorAlert.hbs'),
      downloadLog('experience/components/gaTracking.hbs'),
      downloadLog('experience/components/userIndicator.hbs'),
      downloadLog('experience/layouts/Example Layout.hbs'),
      downloadLog('experience/pages/Dashboard Stream Only.hbs'),
      downloadLog('experience/pages/Dashboard Transferred.hbs'),
      downloadLog('experience/pages/Home Page.hbs'),
      downloadLog('experience/pages/Log In.hbs'),
      downloadLog('experience/pages/dash.hbs'),
      downloadLog('experience/pages/default auto set.hbs'),
      processingLog('experience/components/errorAlert.hbs'),
      processingLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/userIndicator.hbs'),
      processingLog('experience/layouts/Example Layout.hbs'),
      processingLog('experience/pages/Dashboard Stream Only.hbs'),
      processingLog('experience/pages/Dashboard Transferred.hbs'),
      processingLog('experience/pages/Home Page.hbs'),
      processingLog('experience/pages/Log In.hbs'),
      processingLog('experience/pages/dash.hbs'),
      processingLog('experience/pages/default auto set.hbs')
    ]);
    await spy.restore();
    let statusDeferred = defer();
    let statusMessage = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDeferred.resolve();
    });
    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await statusDeferred.promise;
    statusMessage.should.equal(printTable(statusExpHeaders,
      [
        ['errorAlert', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['gaTracking', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['userIndicator', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Example Layout', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Stream Only', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Transferred', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Home Page', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Log In', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['dash', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['default auto set', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')]
      ]));
    await spy.restore();

    await remove('./experience/components/errorAlert.hbs');
    await remove('./experience/components/gaTracking.hbs');
    await writeFile('./experience/pages/dash.hbs', 'hello world...');
    await writeFile('experience/pages/Dashboard Stream Only.hbs', 'Oh hi mark...');
    await ensureFile('./experience/pages/newPage.hbs');
    await writeFile('./experience/pages/newPage.hbs', 'a whole new page!');
    statusDeferred = defer();
    statusMessage = '';
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      statusMessage = message;
      statusDeferred.resolve();
    });
    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'status'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await statusDeferred.promise;
    statusMessage.should.equal(printTable(statusExpHeaders,
      [
        ['errorAlert', 'component', c.red('deleted'), c.gray('unmodified'), c.gray('no')],
        ['gaTracking', 'component', c.red('deleted'), c.gray('unmodified'), c.gray('no')],
        ['userIndicator', 'component', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Example Layout', 'layout', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Stream Only', 'page', c.yellow('modified'), c.gray('unmodified'), c.gray('no')],
        ['Dashboard Transferred', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Home Page', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['Log In', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['dash', 'page', c.yellow('modified'), c.gray('unmodified'), c.gray('no')],
        ['default auto set', 'page', c.gray('unmodified'), c.gray('unmodified'), c.gray('no')],
        ['newPage', 'page', c.green('added'), c.blue('missing'), c.gray('no')]
      ]));
    spy.restore();
    const uploadDeferred = defer();
    const uploadMessages = [];
    spy = sinon.stub(ssLog, 'stdout').callsFake((message) => {
      uploadMessages.push(message);
      if (uploadMessages.length >= 22) {
        uploadDeferred.resolve();
      }
    });
    nock('https://api.losant.com:443', { encodedQueryParams: true })
      .delete('/applications/5b9297591fefb200072e554d/experience/views/59f201edf21ee00007a93a96')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, { success: true },
        [ 'Date',
          'Thu, 18 Oct 2018 19:37:34 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '15063',
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
      .delete('/applications/5b9297591fefb200072e554d/experience/views/59f201ed95c9e70007b7ffc7')
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, { success: true },
        [ 'Date',
          'Thu, 18 Oct 2018 19:37:34 GMT',
          'Content-Type',
          'application/json',
          'Content-Length',
          '15063',
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
      .patch('/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a', { body: 'hello world...' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'hello world...', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
      },
      [ 'Date',
        'Thu, 18 Oct 2018 19:37:34 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '15063',
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
      .patch('/applications/5b9297591fefb200072e554d/experience/views/5a33f4e847308400073d07f4', { body: 'Oh hi mark...' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'dash', viewType: 'page', layoutId: '59f201ed95c9e70007b7ffc3', body: 'hello world...', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
      },
      [ 'Date',
        'Thu, 18 Oct 2018 19:37:34 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '15063',
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
      .post('/applications/5b9297591fefb200072e554d/experience/views', { body: 'a whole new page!', viewType: 'page', name: 'newPage' })
      .query({ _actions: 'false', _links: 'true', _embedded: 'true' })
      .reply(200, {
        name: 'newPage', viewType: 'page', body: 'a whole new page!', applicationId: '5b9297591fefb200072e554d', creationDate: '2017-10-26T20:54:13.012Z', lastUpdated: '2018-09-18T21:46:00.140Z', viewTags: {}, description: '', experienceViewId: '59f24b75ae64aa0007e7618a', id: '59f24b75ae64aa0007e7618a', version: 'develop', layoutName: 'Example Layout', _type: 'experienceView', _links: { self: { href: '/applications/5b9297591fefb200072e554d/experience/views/59f24b75ae64aa0007e7618a' } }
      },
      [ 'Date',
        'Thu, 18 Oct 2018 19:37:34 GMT',
        'Content-Type',
        'application/json',
        'Content-Length',
        '15063',
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

    require('../../commands/experience').parse([
      '/bin/node',
      path.resolve(__dirname, '/bin/losant-experience.js'),
      'upload'
    ]);
    await unlockConfigFiles(CONFIG_FILE);
    await uploadDeferred.promise;
    uploadMessages.sort().should.deepEqual([
      uploadedLog('experience/pages/Dashboard Stream Only.hbs'),
      uploadedLog('experience/pages/dash.hbs'),
      uploadedLog('experience/pages/newPage.hbs'),
      deletedUploadLog('experience/components/errorAlert.hbs'),
      deletedUploadLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/errorAlert.hbs'),
      processingLog('experience/components/gaTracking.hbs'),
      processingLog('experience/components/userIndicator.hbs'),
      processingLog('experience/layouts/Example Layout.hbs'),
      processingLog('experience/pages/Dashboard Stream Only.hbs'),
      processingLog('experience/pages/Dashboard Transferred.hbs'),
      processingLog('experience/pages/Home Page.hbs'),
      processingLog('experience/pages/Log In.hbs'),
      processingLog('experience/pages/dash.hbs'),
      processingLog('experience/pages/default auto set.hbs'),
      processingLog('experience/pages/newPage.hbs'),
      unmodifiedLog('experience/components/userIndicator.hbs'),
      unmodifiedLog('experience/layouts/Example Layout.hbs'),
      unmodifiedLog('experience/pages/Dashboard Transferred.hbs'),
      unmodifiedLog('experience/pages/Home Page.hbs'),
      unmodifiedLog('experience/pages/Log In.hbs'),
      unmodifiedLog('experience/pages/default auto set.hbs')
    ]);
  });
});
