//var sanitize = require('../modules/sanitize');

module.exports = function(app, db, config) {
  
  // MongoDB Schemas
  var User = db.model('User');                                       // Pull in the user schema

  /********************************************************/
  /************************ Routes ************************/

  var sanitize = require('../modules/sanitize');
  app.get('/', function(req, res, next) {
    console.log(sanitize.string("undefined"));
    console.log(sanitize.string(undefined));
    if(sanitize.string(undefined) == undefined)
      console.log("Undefined good");
    if(sanitize.string("undefined") == undefined)
      console.log("Undefined String Good");
  });
  app.get('/users.:format', users);
  app.get('/users/:userId.:format', user);

  app.post('/users.:format', create);
  app.post('/users/:userId.:format', update);

  app.delete('/users/:userId.:format', remove);

  /********************************************************/
  /******************** Route Functions *******************/

  function users(req, res, next) {
    next();
  }

  function user(req, res, next) {
    next();
  }

  function create(req, res, next) {
    next();
  }

  function update(req, res, next) {
    next();
  }

  function remove(req, res, next) {
    next();
  }

};