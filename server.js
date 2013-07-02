var express = require('express'),                                      // We will use express to handle routes and setup of our server.
    expressValidator = require('express-validator'),  
    configModule = require('./config/config'),                         // This is a module that will handle basic server configuraitons.
    config = configModule.config(),                                    // This is our configuration object that stores global settings for the server..
    port = (config.port),                                              // You can set the port using "export PORT=1234" or it will default to your configuration file.
    passport = require('passport'),                                    // Handles authentication
    flash = require('connect-flash'),                                  // Enables flash messages while authenticating with passport.
    mongoose = require('mongoose'),                                    // Object modeling for mongodb database.
    MongoStore = require('connect-mongo')(express),                    // Session store for MongoDB connection.
    fs = require('fs'),                                                // Allows use of the filesystem.
    app = module.exports = express();                                  // Get a new express server.

configModule.configureEnviorment(express, app, config);                // Handle different operating modes set by using "export NODE_ENV=local" or "export NODE_ENV=development" or etc.
app.use(express.cookieParser());                                       // Setup express: enable cookies.
app.use(express.bodyParser());                                         // Setup express: enable body parsing.
app.use(expressValidator);
app.use(flash());                                                      // Setup connect-flash enabling flash messages for passport.
setupDatabase(app, config, function(err, db) {                         // Setup the database and secret sessions.  This must be run after express cookie parser is setup.  This call will block until the database is connected.
  if(err || ! db) 
    return console.log("[ ERROR ] Could setup and connect to the database. \n" + err);

  app.use(passport.initialize());                                      // Setup passport for authentication.
  app.use(passport.session());                                         // Setup passport sessions.  Make sure this is called after setting up express sessions.

  app.use(express.static(config.dirname + config.paths.publicFolder)); // Set the public folder as a static route. The public folder stores css, images, js, etc.
  app.use(app.router);                                                 // Handle all routes
  app.use(express.favicon(config.dirname + config.paths.favIcon));     // Display a favicon, use  express.favicon() to use the express default favicon.

  app.set('views', config.dirname + config.paths.viewsFolder);         // Set up the root directory for our views.
  app.set('view engine', 'jade');                                      // Set our view engin as JADE.

  // Load our routes here, in the order they will be called.
  loadFolder(config.paths.middlewareFolder, app, db, config);          // Load the middleware controllers.
  app.use(allowCors);                                                  // Allow cross origin requests
  loadFolder(config.paths.controllersFolder, app, db, config);         // Load the controller routes
  loadFolder(config.paths.errorsFolder, app, db, config);              // Load error handlers, this should be the last routes loaded.

  if( ! module.parent) {                                               // If we are the main module, aka we were not required from somewhere else.
    app.listen(port);                                                  // Start our server listening on previously declared port.
    if(config.mongodb.enabled)
      console.log("Listening on port %d in %s mode with database %s.", port, app.settings.env, config.mongodb.database);
    else
      console.log("Listening on port %d in %s mode.", port, app.settings.env);
  }
});

/* ---------------------------------------------------- */
/* ------------ END SERVER CONFIGURATIONS ------------- */
/* ---------------------------------------------------- */


/********************************************************/
/************* Server Configuration Methods *************/

/* Load Folders
 * Requires all files in the path specified.
 * This is not recursive.
 */
function loadFolder(relativePath, app, db, config) {
  // Don't try to load a folder you can't.
  if(relativePath === undefined || relativePath === '') {
    console.log("Error: Can't load folder with relative path of undefined");
    return;
  }

  // Make sure there is a '/' at the start of the relative path.
  relativePath = (relativePath.substring(0,1) === '/') ? relativePath : '/' + relativePath;
  if(! fs.existsSync(config.dirname + relativePath)) {
    console.log("Error: Can't load files in a directory that doesn't exist.");
    return;
  }

  var files = fs.readdirSync(config.dirname + relativePath);
  
  files.forEach(function (file) {
    // Don't try to load invalid files
    if(file !== undefined && file !== null) {
      require(config.dirname + relativePath + '/' + file)(app, db, config);
    }
  });
}

/* Setup Database
 * Configure the database you setup in the config file.
 * It will return the connected database object
 *
 * TODO: Find a way to continue on even if the database
 *       fails to connect.
 */
function setupDatabase(app, config, next){
  if(config.mongodb.enabled) {                                         // If we are configuring a Mongo database.
    
    var mongoSessionStore = new MongoStore({                           // Setup a mongo session store and code run on a connection.
      url: config.mongodb.uri,                                         // Store the uri to connect to the database.
      auto_reconnect: true                                             // Enable auto reconnect if the database connection is lost.
    }, function() {                                                    // This function is called after a successful connection is setup by mongo-connect.
      mongoose.connect(config.mongodb.uri);                            // Finally, connect to the MongoDB Database.
      mongoose.connection.on('open', function() {                      // Once the connection is opened.
        console.log("[ OK ] Connected to the database.");

        loadFolder(config.paths.modelsFolder, app, mongoose, config);  // Pull in the MongoDB schemas.

        return next(undefined, mongoose);                              // Return our connection object (in this case it is just mongoose).
      });
    });

    app.use(                                                           // Finally, execute our code to configure our connection to the mongodb database.
      express.session({                                                // Enable express sessions.
        secret: config.express.sessionKey,                             // Setup the secret session key.
        store: mongoSessionStore                                       // Setup & connect to the MongoDB database.
      })
    );
  } else if(config.postgresql.enabled) {                               // If we are configuring a postgresql database.
    
    // TODO: Add configuration for postgresql.
    console.log("[ ERROR ] Could not connect to postgresql, one was not configured.");
    return next(undefined, undefined);
  } else {

    console.log("[ ERROR ] Could not configure and connect to a database because there were not any enabled.")
  }
}

/* Allow cross site calls.  This is required for ajax calls.
 */
function allowCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}