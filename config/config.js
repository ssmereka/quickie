var path    = require('path'),                                       // Path module is used here to resolve paths to dependencies. 
    dirname = path.resolve(__dirname + '../../');                    // Dirname is the path to our root directory.

/********************************************************/
/***************** Config Mode Variables ****************/

/* The following objects are settings or variables used 
 * in your application when running in a specific 
 * evniorment or mode. These object's properties are 
 * combined with the "allConfig" object below to create a 
 * single object.  This final object can then be referenced 
 * throughout your application.
 *
 * There are several modes already defined; local, 
 * development, and production. To run your app in one of 
 * the modes you must set the NODE_ENV variable when 
 * running the node server.  The start script should take
 * care of this for you, run command ./start.sh -h for 
 * more information.
 */


/* Local Mode
 * Use this mode when developing on your local machine.
 * To run your app in local mode, set the NODE_ENV 
 * variable to local. 
 */
var localConfig = {
  protocol: 'http',                                                  // Force the app to use http instead of https.
  debug: true                                                        // Force the app to use debug mode, displaying extra information.
}

/* Development Mode
 * Use this mode when developing or testing on a live or 
 * test server. To run your app in development mode, set 
 * the NODE_ENV variable to development. 
 */
var developmentConfig = {
  host: 'www.mysite.com',                                            // Change the host name from localhost to the server's domain name.
  debug: true,                                                       // Force the app to use debug mode, displaying extra information. 

  mongodb: {                                                         // Configure a MongoDB database connection.
    enabled: true,                                                   // Enable the use of MongoDB.
    useAuthentication: true,                                         // Use authentication.
    username: 'admin',                                               // Username to login to the database.
    password: 'o123cYUMIABCE6KIKKKbYsELtRK5UKjNfvNaN',               // Password to login to the database.
    host: 'blah.mongolab.com',                                       // Host name where the database is hosted.
    port: '33666',                                                   // Database port
    database: 'development'                                          // Database name
  }
}

/* Production Mode
 * Use this mode when running your application on a 
 * production server. To run your app in production mode, 
 * set the NODE_ENV variable to production. 
 */
var productionConfig = {
  host: 'www.mysite.com',                                            // Change the host name from localhost to the server's domain name.

  mongodb: {                                                         // Configure a MongoDB database connection.
    enabled: true,                                                   // Enable the use of MongoDB.
    useAuthentication: true,                                         // Use authentication.
    username: 'admin',                                               // Username to login to the database.
    password: 'o123cYUMIABCE6KIKKKbYsELtRK5UKjNfvNaN',               // Password to login to the database.
    host: 'blah.mongolab.com',                                       // Host name where the database is hosted.
    port: '33666',                                                   // Database port
    database: 'production'                                           // Database name
  }
}


/********************************************************/
/***************** Generic Config Object ****************/

/* The generic configuration object stores the default 
 * values used by your application reguardless of the 
 * enviorment it is operating in.  The properties below
 * are overridden by the properties of the objects above
 * depending on what enviorment you choose to run the 
 * node application in.
 */

var allConfig = {
  host: 'localhost',                                                 // Node server's host name.
  port: '3000',                                                      // The port the server should listen on.
  protocol: 'https',                                                 // The protocol, http or https, used by the server.
  debug: false,                                                      // Disable the display of extra informatino.

  title: 'My Site',                                                  // Default title of all rendered pages.

  dirname: dirname,                                                  // The root directory for the node server application. 
  
  paths: {                                                           // A group of properties describe where different parts of the application can be found. 
    publicFolder: '/public',                                         // Default location where are all public files stored, for example: css, javascript, or images.
    uploadFolder: '/uploads',                                        // Default location for private files that are uploaded by the application.
    modelsFolder: '/models',                                         // Folder where database models are stored.
    viewsFolder: '/views',                                           // Folder where view files are stored, for example: jade, ejs, html, scripts, etc.
    controllersFolder: '/controllers',                               // Folder where the controller files are stored.
    middlewareFolder: '/middleware',                                 // Folder that contains middleware loaded before the controllers.
    errorsFolder: '/errors',                                         // Folder where error routes are stored.
    favIcon: '/public/img/favicon.ico'                               // Location of the sites fav icon.
  },

  api: {                                                             // API related properties.
    currentVersion: 'v1',                                            // The current version of the applications api.
    path: '/api'                                                     // Default root path of the applications api routes.
  },

  express: {                                                         // Variables related to express framework.
    sessionKey: 'Lkd9V6Tg6RV1fPK5KJQCBm3JjCFy4FI0TJVP3kJs'           // Private key used to create express sessions.  Keep this secret.
  },

  mongodb: {                                                         // Configure a MongoDB database connection.
    enabled: true,                                                   // Enable the use of MongoDB.
    useAuthentication: false,                                        // Don't use authentication.
    host: 'localhost',                                               // Host name where the database is hosted.
    port: '27017',                                                   // Database port
    database: 'development'                                          // Database name
  }
}


/********************************************************/
/******************** Config Methods ********************/

/* Create Config Object
 * Create a single object that holds all the settings for
 * the node application.  This will determine which
 * objects to combine based on the node enviorment 
 * specified.  It will also fill in a few other settings.
 * 
 * Return: The configuration object to be used by the node
 *         application.
 */
function createConfigObject() {
  var env = '',                                                      // Holds the node enviorment.
      obj = undefined;                                               // Holds the configuration object to be returned.

  if(process.env.NODE_ENV !== undefined)                             // If the node enviorment was specified in the command line, then set it.
    env = process.env.NODE_ENV.toLowerCase();

  switch(env) {
    case 'local':
      obj = mergeObjects(localConfig, allConfig)                     // Merge the two settings objects into one, overwriting objects in allConfig with values from localConfig.
      break;
    case 'development':
      obj = mergeObjects(developmentConfig, allConfig, env);         // Merge the two settings objects into one, overwriting objects in allConfig with values from developmentConfig.
      break;
    case 'production':
      obj = mergeObjects(productionConfig, allConfig, env);          // Merge the two settings objects into one, overwriting objects in allConfig with values from productionConfig.
      break;
    default:                                                         // The enviorment mode was not set or was not recognized. 
      obj = allConfig;                                               // Set the configuration object to the generic one.
      if(env !== '') {
        console.log("Node enviorment '" 
          + process.env.NODE_ENV 
          + "' is not recognized");
      }
      break;
  }                      

  if(process.env.PORT !== undefined)                                 // Set the port if specified from the command line.
    obj[port] = process.env.PORT;

  obj['enviorment'] = env;                                           // Store the enviorment

  if(env === 'local') {                                              // Create and store the server's URI.
    obj['host_uri'] = obj['protocol'] + '://' 
                      + obj['host'] + ':' + obj['port'];
  } else {
    obj['host_uri'] = obj['protocol'] + '://' 
                      + obj['host'];
  }

  if( obj['mongodb']['enabled'] === true 
      && obj['mongodb']['useAuthentication'] === true ) {            // Create and store the MongoDB URI.
    obj['mongodb']['uri'] = 'mongodb://' 
                            + obj['mongodb']['username']
                            + ':' 
                            + obj['mongodb']['password'] 
                            + '@' 
                            + obj['mongodb']['host'] 
                            + ':' 
                            + obj['mongodb']['port'] 
                            + '/' 
                            + obj['mongodb']['database'];
  } else {
    obj['mongodb']['uri'] = 'mongodb://' 
                            + obj['mongodb']['host'] 
                            + ':' 
                            + obj['mongodb']['port'] 
                            + '/' 
                            + obj['mongodb']['database'];
  }

  obj['host_api_uri'] = obj['host_uri']                              // Create and store the server's API URI.
                        + obj['api']['path'] 
                        + '/' 
                        + obj['api']['currentVersion'];

  return obj;                                                        // Return the single configured object.
}

/* Merge Objects
 * Combine two object's attributes giving priority
 * to the first object's (obj1) attribute values.
 */
function mergeObjects(obj1, obj2) {
  for(var key in obj2) {
    if(obj1[key] === undefined)
      obj1[key] = obj2[key];
  }
  return obj1;
}

/* Configure Enviorment
 * Configure the node server based on the enviorment it is in.
 * 
 */
var configureEnviorment = function(express, app, config) {
  if(! express || ! app || ! config) {                               // Make sure we don't crash because a parameter was undefined.
    console.log("Could not configure the enviorment because" +
      " one or more of the parameters were undefined.");
    return false;
  }

  switch(config.enviorment) {                                        // Configure the server based on the enviorment.
    
    case 'local':                                                    // Local Mode
      app.enable('verbose errors');                                  // Display extra information about errors.
      app.use(express.logger('dev'));                                // Display express debug information.
      return true;

    case 'development':                                              // Development Mode
      app.enable('verbose errors');                                  // Display extra information about errors.
      app.use(express.logger('dev'));                                // Display express debug information.
      return true;

    case 'production':                                               // Production Mode
      app.disabled('verbose errors');                                // Don't display extra information about the errors.
      return true;

    default:                                                         // Mode unknown.
      return (config.enviorment === '') ? true : false;              // If the enviorment was set, but not recognized, then return false.
  } 
}


/********************************************************/
/************ Export Public Functions Methods ***********/

module.exports.config = createConfigObject;
module.exports.configureEnviorment = configureEnviorment;