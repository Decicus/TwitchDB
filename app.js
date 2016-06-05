// dependencies
var express = require('express'),
  swig = require('swig'),
  markedSwig = require('swig-marked'),
  extras = require('swig-extras'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  helpers = require('./helpers'),
  config = require('./config'),
  db = require('./db'),
  app = express();

// app config
global.__base = __dirname + '/';

markedSwig.useFilter(swig);
extras.useFilter(swig, 'truncate');
markedSwig.useTag(swig);
markedSwig.configure({
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: false,
  smartypants: false
});

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/pub'));
app.use(cookieParser());
app.use(session({secret: config.app.cookie, resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

app.set('view cache', false);
swig.setDefaults({cache: false});

swig.setFilter('random', helpers.general.random);

app.locals = {
	authurl: config.twitch.authurl,
  rng: Math.floor((Math.random() * 100) + 1),
};
app.get('*', (req, res, next) => {
  if(req.session.token && req.session.name) {
		app.locals.loggedin = true;
		app.locals.name = req.session.name;
    app.locals.isadmin = req.session.isadmin;
	} else {
		app.locals.loggedin = false;
	}
	next();
});

//routes

require('./routes')(app);

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
		res.redirect('/');
	});
});

app.use(function(err, req, res, next) {
  console.log(err);
  res.redirect('/');
});

// serve that shizz
var server = app.listen(config.app.port, () => {
	console.log('listening on:' + config.app.port);
});
