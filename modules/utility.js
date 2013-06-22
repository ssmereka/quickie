/* Utility Functions
 * Generic functions that are accessable to all controllers.
 * -----------------------------------------------------------
 */

var bcrypt      = require('bcrypt'),                                                // Include bcrypt for password hashing.
    saltRounds  = 10,                                                               // Number of rounds used to caclulate a salt for bcrypt password hashing.
    crypto      = require('crypto');

var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

exports.loadSchemaObject = function(Schema, populateFields, populateSelects, populateModels, populateConditions)  {
  return function(req, res, next) {

    if(req.params.id) {
      Schema.findOne({'_id': req.params.id}).populate(populateFields, populateSelects, populateModels, populateConditions).exec(function(err, obj) {
        if(err) {
          req.errorMessages.push(err);
          req.queryResult = undefined;
        }
        else
          req.queryResult = obj;
        return next();
      });
    } else {
      return next();
    }
  }
};

exports.render = function(res, page, params) {
  res.render(page, params);
}

exports.send = function(req, res, obj) {
  if(req.isHtml)
    return res.send(obj);

  // Throw error.
}


exports.generateHashedKey = function(keyLength, next) {
  require('./utility').generateKey(keyLength, function(err, key) {
    if(key === undefined || key === null || key === "")
      return next(new Error('Key generation failed.'));

    bcrypt.hash(key, saltRounds, function(err, hash) {       // Generate a salt and hash
      if(err) return next(err);                              // Let the next function handle the error.
      
      return next(null, hash);                               // Set the user's password hash
    });
  });
}

exports.generateHashedKeySync = function(keyLength) {
  try {
    return bcrypt.hashSync(require('./utility').generateKeySync(keyLength).toLowerCase(), saltRounds);
  } catch(ex) {
    console.log("GenerateHashKeySync(" + keyLength + "): Error " + ex);
    return undefined;
  }
}

exports.generateKey = function(keyLength, next) {
  crypto.randomBytes(keyLength, function(ex, buf) {
    next(null, buf.toString('hex').toLowerCase());
  });
}

exports.generateKeySync = function(keyLength) {
  try {
    return crypto.randomBytes(keyLength).toString('hex').toLowerCase();
  } catch(ex) {
    console.log("GenerateBaseKeySync(" + keyLength + "): Error " + ex);
    return undefined;
  }
}


/* Copy Object
 * Create a copy of one object to another.
 * This is typically used when you want to add new fields to a 
 * strickly typed schema object.  By making a copy, you remove the
 * restrictions.
 * Params:
 *    obj - is the object you want to make a copy of.
 * Return: A new copy of the object will be created and returned.
 * Note:  This is not a "deep copy", meaning if schema's exist in a
 *        lower level (aka you called populate on an object before copying),
 *        then the lower level schema will still be in effect.
 */
exports.copyObject = function (obj) {
  var copyObj = {};             // Create our new object.
  for(var key in obj) {         // For each attribute in the original object
    copyObj[key] = obj[key];    // Copy the attribute to the new object.
  }
  return copyObj;               // Return our new object.
}

exports.saveOrReturnObject = function(obj, isSave, next) {
  if(isSave === undefined || isSave === true)
    obj.save(next);
  else
    next(null, obj); 
}

exports.isObjectId = function(value) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(value);
}

exports.isPossiblePartnerKey = function(value) {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{32}$");
  return checkForHexRegExp.test(value);
}

exports.isObjectEmpty = function(obj) {
  if(obj === null)
    return true;

  if(obj.length && obj.length > 0)
    return false;

  if(obj.length === 0)
    return true;

  for(var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key))
      return false;
  }
  return true;
}


/* Get Date Difference
 * Returns the difference between two dates.
 * A Postitive number is a date in the future where negative is in the past.
 */
function getDateDiff(date1, date2) {
  if( ! (date1 instanceof Date) || ! (date2 instanceof Date))
    return undefined
  return (date1.getTime() - date2.getTime());
}

exports.getDateDiff = function(date1, date2) {
  return getDateDiff(date1, date2);
}
exports.getDateDiffMilliseconds = function(date1, date2) {
  return getDateDiff(date1, date2);
}
exports.getDateDiffSeconds = function(date1, date2) {
  return getDateDiff(date1, date2) / 1000
}
exports.getDateDiffMinutes = function(date1, date2) {
  return getDateDiff(date1, date2) / (1000 * 60)
}
exports.getDateDiffHours = function(date1, date2) {
  return getDateDiff(date1, date2) / (1000 * 60 * 60)
}
exports.getDateDiffDays = function(date1, date2) {
  return getDateDiff(date1, date2) / (1000 * 60 * 60 * 24)
}


/* Get Positive Date Difference
 * Returns the difference between two dates, but is always a positive number.
 */
exports.getPositiveDateDiff = function(date1, date2) {
  if( ! (date1 instanceof Date) || ! (date2 instanceof Date))
    return undefined
  return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
}