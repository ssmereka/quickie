var mongoose    = require('mongoose'),                     // Include object modeling for MongoDB
    Schema      = mongoose.Schema,                         // Mongoose schema object for MongoDB documents.
    ObjectId    = Schema.ObjectId;                         // Object ID used in mongoose schemas

module.exports = function(app, db, config) {

/********************************************************/
/********************** User Schema *********************/

  /* User Schema
   * Describes a user in the database.
   */
  var User = new Schema({
    
  });

  
/********************************************************/
/************** Export Schemas and Methods **************/

  mongoose.model('User', User);                                  //Set the user schema.
};