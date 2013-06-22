//var sanitize = require('../modules/sanitize');
  var utility = 

module.exports = function(app, db, config) {
  
  // MongoDB Schemas
  var User = db.model('User');                                       // Pull in the user schema

  /********************************************************/
  /************************ Routes ************************/

  app.get('/users.:format', users);
  app.get('/users/:userId.:format', user);

  app.post('/users.:format', create);
  app.post('/users/:userId.:format', update);

  app.delete('/users/:userId.:format', remove);

  /********************************************************/
  /******************** Route Functions *******************/

  /* User
   * Get and return a user object specified by their Object ID.
   */
  function user(req, res, next) {
    var user = req.queryResult;
    if( ! req.queryResult) return next();

    if(req.isHtml)
      return utility.render(res, 'user/user', { user: user });

    utility.send(req, res, user);
  }

  /* Users
   * Get all the users and return them in the requested format.
   */
  function users(req, res, next) {
    User.find().sort('name').exec(function(err, users) {
      if(err) return next(err);

      if(req.isHtml)
        return utility.render(res, 'user/users', { users: users });

      utility.send(req, res, users);
    });
  }

  /* Create
   */
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