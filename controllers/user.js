var utility  = require("../modules/utility"),
    sanitize = require("../modules/sanitize");

module.exports = function(app, db, config) {
  
  var User = db.model('User');                                       // Pull in the user schema


  /********************************************************/
  /************************ Routes ************************/

  app.get('/users.:format', users);                                  // Get all users.
  app.get('/users/:userId.:format', user);                           // Get a specific user.

  app.post('/users.:format', create);                                // Create a new user.
  app.post('/users/:userId.:format', update);                        // Update an existing user.

  app.delete('/users/:userId.:format', remove);                      // Delete an existing user.


  /********************************************************/
  /******************** Route Functions *******************/

  /* User
   * Get and return the user object specified by their Object ID.
   * If the 
   */
  function user(req, res, next) {
    var user = req.queryResult;                                      // Get the user object queried from the url's userId paramter.
    if( ! req.queryResult) return next();                            // If the user object is blank, then the requested user was not found and we cannot handle the request here, so move along.

    if(sanitize.isHtml(req))                                         // If the request was for HTML, then render the user's view.
      return utility.render(res, 'user/user', { user: user });

    utility.send(user, req, res);                                    // Handles the request by sending back the appropriate response, if we havn't already.
  }

  /* Users
   * Get all the users and return them in the requested format.
   */
  function users(req, res, next) {
    User.find().sort('name').exec(function(err, users) {             // Find all the users and sort them by their name attribute.
      if(err) return next(err);

      if(sanitize.isHtml(req))                                       // If the request was for HTML, then render the users view.
        return utility.render(res, 'user/users', { users: users, hostUrl: config.host_uri });

      utility.send(users, req, res);                                 // Handles the request by sending back the appropriate response, if we havn't already.
    });
  }

  /* Create
   * Create a new user with the attributes specified in the post 
   * body.  Then return that new user object in the specified format.
   */
  function create(req, res, next) {
    var user = new User();
    user.update(req.body, (req.user) ? req.user._id : undefined, function(err, user) {  // Update the new user object with the values from the request body.  Also, if the person creating the new user is identified, send that along in the request.
      if(err) next(err);

      if(sanitize.isHtml(req))                                                          // If the request was for HTML, then redirect to the users page.
        return res.redirect('/users.html');

      utility.send(user, req, res);                                                     // Handles the request by sending back the appropriate response, if we havn't already.
    });
  }

  /* Update
   * Update an existing user's information with the attributes specified
   * in the post boyd.  Then return that updated user object in the 
   * format specified.
   */
  function update(req, res, next) {
    var user = req.queryResult;                                      // Get the user object queried from the url's userId paramter.
    if( ! req.queryResult) return next();                            // If the user object is blank, then the requested user was not found and we cannot handle the request here, so move along.

    user.update(req.body, (req.user) ? req.user._id : undefined, function(err, user) {  // Update the user object with the values from the request body.  Also, if the person updating the user is identified, send that along in the request.
      if(sanitize.isHtml(req))                                       // If the request was for HTML, then redirect to the users page.
        return res.redirect('/users.html');

      utility.send(user, req, res);                                  // Handles the request by sending back the appropriate response, if we havn't already.
    });
  }

  /* Remove
   * Delete an existing user from the database along with any 
   * information linked to them.  Then return the deleted user
   * object in the format specified.
   */
  function remove(req, res, next) {
    var user = req.queryResult;                                      // Get the user object queried from the url's userId paramter.
    if( ! req.queryResult) return next();                            // If the user object is blank, then the requested user was not found and we cannot handle the request here, so move along.

    user.delete((req.user) ? req.user._id : undefined, function(err, user, success) {  // Delete the user object and anything linked to it.  Also, if the person deleting the user is identified, send that along in the request.
      if(err) return next(err);

      if(sanitize.isHtml(req))                                       // If the request was for HTML, redirect to the users page.
        return res.redirect('/users.html');

      utility.send(user, req, res);                                  // Handles the request by sending back the appropriate response, if we havn't already.   
    });
  }

};