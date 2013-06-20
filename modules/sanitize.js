var sanitize = function () {};

  /* ***************************************************************************

     Sanitize
     These methods are used clean up user or client side values so that they are
     handled correctly by server side javascript. 
    
     For example: 
     Client side javascript may send a string value of "undefined" when really 
     it wanted to send the value undefined.  Using the sanitize string method 
     we can detect this and set the value to the appropriate undefined value.

   * ***************************************************************************/

  /* Sanitize String
   * Ensure the parameter is a string or undefined.
   */
  sanitize.prototype.string = function(value) {
    if(value === undefined || value === null || value === "undefined" || value === "null")
      return undefined;
    return value.toString();
  }

  /* Sanitize Value 
   * Ensure the parameter is a value or undefined.
   */
  sanitize.prototype.value = function(value) {
    if( value === undefined || value === null )
      return undefined;
    if( value === "undefined" || value === "null" )
      return undefined;
    
    return value;
  };

  /* Sanitize Boolean
   * Ensure the parameter is true, false, or undefined.
   */
  sanitize.prototype.boolean = function(value) {
      if(sanitize.prototype.value(value) !== undefined) {
        if(value === true || value === "true" || value === "TRUE")
          return true;
        if(value === false || value === "false" || value === "FALSE")
          return false;
      }
      return undefined;
  };

  /* Sanitize Nubmer
   * Ensure the parameter is a number or undefined.
   */
  sanitize.prototype.number = function(value) {
    var valueAsFloat = undefined;
    if(sanitize.prototype.value(value) !== undefined) {
      try {
        valueAsFloat = parseFloat(value);
      } catch (exception) {
        console.log("'"+value+"' could not be verified as a number or not because parseFlaot failed.");
      }
    }

    return (!isNaN(valueAsFloat) && isFinite(value)) ? valueAsFloat : undefined;
  }

  /* Sanitize Integer
   * Make sure the parameter is an integer or undefined.
   */
  sanitize.prototype.integer = function(value) {
    var number = undefined;
    if(sanitize.prototype.value(value) !== undefined) {
      try {
        number = parseInt(value, 10);
      } catch (exception) {
        console.log("'"+value+"' could not be converted to an integer.");
      }
    }
    number = (isNaN(number)) ? undefined : number;
    return number;
  };

  /* Sanitize Flaot
   * Ensure the parameter is a floating point number or undefined.
   */
  sanitize.prototype.float = function(value) {
    return sanitize.prototype.number(value);
  };

  /* Regular Expression - 24 Character Hex String
   * A regular expression to check if a string is 24 characters long and using hex
   * characters.  This is used to verify a string can be used as an Object ID as 
   * defined by MongoDB.
   */
  sanitize.prototype.checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

  /* Sanitize Object ID String
   * Ensure the parameter is a string capable of being an Object ID 
   * as defiend by MongoDB.
   */
  sanitize.prototype.objectIdString = function(value) {
    if(sanitize.prototype.string(value) !== undefined) {
      if((sanitize.prototype.value(value) !== undefined) && (sanitize.prototype.checkForHexRegExp.test(value))) {
        return value;
      } else {
        console.log("'"+value+"' is not a valid object id string.");
      }
    }
    return undefined;
  }
 
  /* Sanitize Object Id
   * Ensure the parameter is a Mongo DB Object ID or undefined.
   */
  sanitize.prototype.objectId = function(value, Mongoose) {
    var objectId = undefined;

    if(Mongoose === undefined)
      Mongoose = require('mongoose');

    if(sanitize.prototype.objectIdString(value) !== undefined) {
      try {
        objectId = new Mongoose.Types.ObjectId(value.toString());
      } catch (exception) {
        console.log("Error converting " + value + " to an object id.");
      }
    }
    return objectId; 
  };

  /* Sanitize Object ID Array
   * Ensure the parameter is an array of Object IDs or undefined.
   * This means it could be an empty array as well.
   */
  sanitize.prototype.objectIdArray = function(array) {
    if( Object.prototype.toString.call( array ) !== '[object Array]') {     // Check if the parameter is an array.
      return undefined;                                                     // Return undefined if it is not.
    }

    var ObjectId = require('mongoose').Types.ObjectId; 
    var objectIdArray = [];
    
    for(var key in array) {
      try {
        objectIdArray.push(new ObjectId(array[key]));                       // TODO: Test this with an actual object id.
      } catch( exception ) {
        console.log(exception);
        return undefined;
      }
    }
    return objectIdArray;
  };

  /* Sanitize Array
   * Ensure the parameter is an array or undefined.
   */
  sanitize.prototype.array = function(array) {
    if(sanitize.prototype.value(array) !== undefined && Object.prototype.toString.call( array ) === '[object Array]')
      return array;
    return undefined;
  };

  /* Sanitize Date
   * Ensure the parameter is a date object or undefined.
   */
  sanitize.prototype.date = function(value) {
    var date = undefined;
    if(sanitize.prototype.value(value) !== undefined) {
      try {
        date = new Date(value);
      } catch (exception) {
        console.log("'"+value+"' could not be converted to a date.");
      }
    }
    return date;
  };

  /* Is Html
   * Returns true if the request parameter is an html request.
   * The :format parameter must be used in the url path for this
   * function to work correctly.
   */
  sanitize.prototype.isHtml = function(req) {
    if(req && req.params && req.params.format && req.params.format === 'html')
      return true;
    return false;
  };

  /* Is Json
   * Returns true if the request parameter is an json request.
   * The :format parameter must be used in the url path for this
   * function to work correctly.
   */
  sanitize.prototype.isJson = function(req) {
    if(req && req.params && req.params.format && req.params.format === 'json')
      return true;
    return false;
  };

  /* Is Text
   * Returns true if the request parameter is an text request.
   * The :format parameter must be used in the url path for this
   * function to work correctly.
   */
  sanitize.prototype.isText = function(req) {
    if(req && req.params && req.params.format && (req.params.format === 'text' || req.params.format === 'txt'))
      return true;
    return false;
  };

  /* Is Xml
   * Returns true if the request parameter is an xml request.
   * The :format parameter must be used in the url path for this
   * function to work correctly.
   */
  sanitize.prototype.isXml = function(req) {
    if(req && req.params && req.params.format && req.params.format.toLowerCase() === 'xml')
      return true;
    return false;
  };

module.exports = new sanitize();