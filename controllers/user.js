//var sanitize = require('../modules/sanitize');
var utility = require("../modules/utility");

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

      utility.send(users, req, res);
    });
  }

  /* Create
   */
  function create(req, res, next) {
    console.log(req.body);
    var user = new User();
    user.update(req.body, (req.user) ? req.user._id : undefined, function(err, user) {
      if(err) next(err);

      if(req.isHtml)
        return utility.render(res, 'user/user', { user: user });

      utility.send(user, req, res);
    });
  }

  function update(req, res, next) {
    var user = req.queryResult;
    if( ! req.queryResult) return next();

    user.update(req.body, (req.user) ? req.user._id : undefined, function(err, user) {
      if(req.isHtml)
        return res.redirect('/users.html');

      utility.send(user, req, res);
    });
  }

  function remove(req, res, next) {
    var user = req.queryResult;
    if( ! req.queryResult) return next();

    console.log("Remove user");
    user.delete((req.user) ? req.user._id : undefined, function(err, user, success) {
      if(err) return next(err);

      if(req.isHtml)
        return res.redirect('/users.html');
      console.log("removed!");
      utility.send(user, req, res);        
    });
  }

};