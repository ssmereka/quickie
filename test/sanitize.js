var assert   = require('assert'),
    shared   = require('./shared'),
    sanitize = require('../modules/sanitize');

describe('sanitize', function() {
  
  describe('#string()', function() {
    shared.shouldSanitizeStrings();
    it('should return a string if the parameter was a string.', function() {
      assert.strictEqual("", sanitize.string(""));
      assert.strictEqual("BlaH", sanitize.string("BlaH"));
    });
  });

  describe('#value()', function() {
    shared.shouldSanitizeStrings();
  });

  describe('#boolean()', function() {
    shared.shouldSanitizeStrings();
    it('should return a boolean true or false, even if the value is a string.', function() {
      assert.strictEqual(true, sanitize.boolean(true));
      assert.strictEqual(true, sanitize.boolean("true"));
      assert.strictEqual(false, sanitize.boolean(false));
      assert.strictEqual(false, sanitize.boolean("false"));
    });
    it('should return undefined if the value cannot be serialized into a boolean.', function() {
      assert.strictEqual(undefined, sanitize.boolean(""));
      assert.strictEqual(undefined, sanitize.boolean([]));
      assert.strictEqual(undefined, sanitize.boolean({}));
      assert.strictEqual(undefined, sanitize.boolean("asldfjalsfjs"));
      assert.strictEqual(undefined, sanitize.boolean(5));
      assert.strictEqual(undefined, sanitize.boolean([{}, {}]));
      assert.strictEqual(undefined, sanitize.boolean(Date.now()));
    });
  });

  describe('#number()', function() {
    shared.shouldSanitizeStrings();
    it('should return a number reguardless of number type, such as integer, float, etc.', function() {
      assert.strictEqual(1.234, sanitize.number(1.234));
      assert.strictEqual(-1.234, sanitize.number(-1.234));
      assert.strictEqual(1, sanitize.number(1));
      assert.strictEqual(-1, sanitize.number(-1));
      assert.strictEqual(1.234, sanitize.number("1.234"));
      assert.strictEqual(-1.234, sanitize.number("-1.234"));
      assert.strictEqual(1, sanitize.number("1"));
      assert.strictEqual(-1, sanitize.number("-1"));
      assert.strictEqual(Number.MAX_VALUE, sanitize.number(Number.MAX_VALUE));
      assert.strictEqual(Number.MIN_VALUE, sanitize.number(Number.MIN_VALUE));
    });

    it('should return undefined for values that cannot be serialized into numbers.', function() {
      assert.strictEqual(undefined, sanitize.number(""));
      assert.strictEqual(undefined, sanitize.number([]));
      assert.strictEqual(undefined, sanitize.number({}));
      assert.strictEqual(undefined, sanitize.number("asldfjalsfjs"));
      assert.strictEqual(undefined, sanitize.number([{}, {}]));
    });
  });

  describe('#integer()', function() {
    shared.shouldSanitizeStrings();
    it('should return an integer value if the parameter can be serialized into an integer.', function() {
      assert.strictEqual(123456, sanitize.integer("123456"));
      assert.strictEqual(0, sanitize.integer(0));
      assert.strictEqual(-123456, sanitize.integer(-123456));
      assert.strictEqual(parseInt(Number.MAX_VALUE), sanitize.integer(Number.MAX_VALUE));
      assert.strictEqual(parseInt(Number.MIN_VALUE), sanitize.integer(Number.MIN_VALUE));
      assert.notEqual(undefined, sanitize.integer(Number.MAX_VALUE));
      assert.notEqual(undefined, sanitize.integer(Number.MIN_VALUE));
    });

    it('should convert floating point numbers into integer values.', function() {
      assert.strictEqual(5, sanitize.integer(5.123));
      assert.strictEqual(5, sanitize.integer("5.123"));
      assert.strictEqual(-123, sanitize.integer(-123.321));
      assert.strictEqual(-123, sanitize.integer("-123.321"));
    });

    it('should return undefined for non-integer values.', function() {
      assert.strictEqual(undefined, sanitize.integer(""));
      assert.strictEqual(undefined, sanitize.integer([]));
      assert.strictEqual(undefined, sanitize.integer({}));
      assert.strictEqual(undefined, sanitize.integer("asldfjalsfjs"));
      assert.strictEqual(undefined, sanitize.integer([{}, {}]));
    });

  });

/*
  describe('#objectIdString()', function() {
    shared.shouldSanitizeStrings();
    it('', function() {
      assert.strictEqual("", sanitize.boolean());
    });
  });

  describe('#objectId()', function() {
    shared.shouldSanitizeStrings();
    it('', function() {
      assert.equal("", sanitize.boolean());
    });
  });

  describe('#objectIdArray()', function() {
    shared.shouldSanitizeStrings();
    it('', function() {
      assert.equal("", sanitize.boolean());
    });
  });

  describe('#array()', function() {
    shared.shouldSanitizeStrings();
    it('', function() {
      assert.equal("", sanitize.boolean());
    });
  });

  describe('#date()', function() {
    shared.shouldSanitizeStrings();
    it('', function() {
      assert.equal("", sanitize.boolean());
    });
  }); */

});