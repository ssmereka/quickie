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