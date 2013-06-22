var passport       = require('passport'),
    Cookies        = require('cookies'),
    utility        = require('../modules/utility'),
    load           = utility.loadSchemaObject,
    flash          = require('connect-flash');

module.exports = function(app, db, config) {
 
  // MongoDB Schemas
  var User = db.model('User');

  /****************************************/
  /**************** Routes ****************/

  // Route Arrays
  var setLocalVariables = [setFormatParam, setApiLocalVariables, setViewLocalVariables]

  app.all('/*', setLocalVariables);

  app.all('/users/:id*', load(User));


  /****************************************/
  /************ Routes Methods ************/

  function setViewLocalVariables(req, res, next) {
    if(req === undefined || req.isApiRequest === true)
      return next();
    app.locals({
      _debug: config.debug,  
      serverEnviorment: app.settings.env,
      title: config.title,
      isSession: (req.user === undefined) ? false : true,
      errorMessages: [],
      errorCode: '',
      //roles: (req.user === undefined || req.user.role === undefined) ? 'none' : req.user.role,
      userId: (req.user === undefined) ? undefined : req.user._id
    });

    next();
  }

  function setApiLocalVariables(req, res, next) {
    if(req === undefined || req.params === undefined || req.params.apiVersion === undefined) {
      req.isApiRequest = false;
      return next();
    }

    req.isApiRequest = true;
    next();
  }

  function setFormatParam(req, res, next) {
    if(req === undefined || req.params.format === undefined)
      return next();

    var format = req.params.format.toLowerCase();
    switch(format) {
      case 'text':
      case 'txt':
        req.params.format = 'text';
        req.isText = true;
        break;

      case 'xml':
        req.params.format = 'xml';
        req.isXml = true;
        break;

      case 'json':
        req.params.format = 'json';
        req.isJson = true;
        break;

      case 'html':
      case 'php' :
      case 'js'  :
      case 'jade':
      default: 
        req.params.format = 'html';
        req.isHtml = true;
        break;
    }

    next();
  }

};