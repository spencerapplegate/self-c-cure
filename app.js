/**
 * Module dependencies.
 */

var express = require('express'),
    swig = require('./lib/swig'), // https://github.com/paularmstrong/swig/tree/master/docs
    port = process.env.PORT || 8142;

GLOBAL.app = module.exports = express.createServer();

app.configure('development', function() {
    app.config = JSON.parse(require('fs').readFileSync('./config/development.json', 'utf8'));
    swig.init({
        root: __dirname + '/view',
        allowErrors: true,
        cache: false
    });
});

app.configure('production', function() {
	app.config = {};
    swig.init({
        root: __dirname + '/view',
        allowErrors: false, // ? allows errors to be thrown and caught by express
        cache: true
	});
});

// Configuration

app.configure(function() {
    app.use(express.logger({
        format: app.config.logger.format
    }));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'changeME' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/src'));
});

// Show errors, keep bots away
app.configure('development', function() {
	app.use(express.errorHandler({
		'dumpExceptions': true,
		'showStack': true
	}));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// this is important to show fields with errors
if (!app.helpers) {
    app.helpers = {};
}
app.helpers.displayErrors = require('./helpers/form_helper.js').displayErrors;

require('./models/models_main.js');
routes = require('./routes/routes_main.js');

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
